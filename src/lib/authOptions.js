import CredentialsProvider from 'next-auth/providers/credentials';
import { collections, dbConnect } from '@/lib/dbConnect';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',

      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        const user = await dbConnect(collections.USER).findOne({ email });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || 'user',
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const { email, name, image } = user;
          const userCollection = dbConnect(collections.USER);
          const isExist = await userCollection.findOne({ email });
          if (!isExist) {
            const newUser = {
              name,
              email,
              image,
              provider: 'google',
              role: 'user',
              createdAt: new Date(),
            };
            const res = await userCollection.insertOne(newUser);
            user.id = res.insertedId.toString();
          } else {
            user.id = isExist._id.toString();
            user.role = isExist.role || 'user';
          }
        } catch (error) {
          console.error('Error in Google signIn callback:', error);
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        if (user.image) {
          token.image = user.image;
        }
      } else if (token?.email) {
        // Fetch latest role directly from DB so admin promotions take effect immediately
        try {
          const dbUser = await dbConnect(collections.USER).findOne({ email: token.email });
          if (dbUser?.role) {
            token.role = dbUser.role;
          }
        } catch (e) {
          // ignore
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (token.image || token.picture) {
          session.user.image = token.image || token.picture;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
