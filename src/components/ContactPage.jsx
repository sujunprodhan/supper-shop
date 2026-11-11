import Container from '@/layout/Container';
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaHeadset,
  FaComments,
} from 'react-icons/fa';

const ContactPage = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <div className="bg-white">
      <div className="relative overflow-hidden bg-linear-to-b from-sky-50/70 via-white to-white py-14 md:py-20 border-b border-slate-100">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
        <div className="pointer-events-none absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl"></div>

        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-4 py-1.5 text-xs md:text-sm font-semibold text-sky-700 shadow-xs">
              <FaHeadset className="text-sky-600" />
              <span>We&apos;re Here 24/7</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Get in Touch with{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-600 to-indigo-600">
                Our Team
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Have questions about an order, want to partner with us, or have feedback? Drop us a
              message and we&apos;ll get back to you in under 15 minutes.
            </p>
          </div>
        </Container>
      </div>
      <div className="py-12 border-b border-slate-100 bg-slate-50/50">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 text-center space-y-3 hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 text-lg">
                <FaPhoneAlt />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Call Support</h3>
              <p className="text-xs text-slate-500">Toll-free customer hotline</p>
              <a
                href="tel:+8801800123456"
                className="block text-sm font-bold text-sky-600 hover:underline"
              >
                +880 1800 123 456
              </a>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 text-center space-y-3 hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 text-lg">
                <FaEnvelope />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Email Us</h3>
              <p className="text-xs text-slate-500">Quick response within 1 hour</p>
              <a
                href="mailto:support@supershop.com"
                className="block text-sm font-bold text-emerald-600 hover:underline"
              >
                support@supershop.com
              </a>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 text-center space-y-3 hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 text-lg">
                <FaMapMarkerAlt />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Head Office</h3>
              <p className="text-xs text-slate-500">Gulshan-2, Dhaka</p>
              <p className="text-sm font-bold text-slate-700">Plot 12, Road 4, Dhaka 1212</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 text-center space-y-3 hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 text-lg">
                <FaClock />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Service Hours</h3>
              <p className="text-xs text-slate-500">Express delivery 7 days a week</p>
              <p className="text-sm font-bold text-slate-700">7:00 AM – 11:00 PM Daily</p>
            </div>
          </div>
        </Container>
      </div>
      <div className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
              <div className="space-y-2 mb-8">
                <div className="inline-block rounded-lg bg-sky-100/70 px-3 py-1 text-xs font-bold text-sky-700 uppercase tracking-wider">
                  Send a Message
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  How Can We Help You?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Fill out the form below and our customer support team will reply promptly.
                </p>
              </div>

              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">First Name</label>
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+880 1..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Subject</label>
                  <input
                    type="text"
                    placeholder="Order query, delivery help, or feedback"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us more about how we can help..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700 hover:-translate-y-0.5 transition-all"
                >
                  <FaPaperPlane className="text-xs" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            {/* Right Side: Quick Assistance Card & FAQ */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl bg-linear-to-tr from-sky-600 to-indigo-600 p-8 text-white shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-6">
                  <FaComments className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-black mb-3">Live Instant Support</h3>
                <p className="text-sm text-sky-100 leading-relaxed mb-6">
                  Need immediate help with an ongoing delivery? Connect with our dedicated support
                  agents on live chat or WhatsApp for instant solutions.
                </p>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-sky-700 shadow-md hover:bg-sky-50 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>

              {/* FAQ Accordion */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-lg">Frequently Asked</h4>
                <div className="space-y-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                    <p className="font-bold text-slate-800">What is the delivery area?</p>
                    <p className="text-xs text-slate-500 mt-1">
                      We currently deliver across all major zones in Dhaka within 30 minutes.
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                    <p className="font-bold text-slate-800">How do returns work?</p>
                    <p className="text-xs text-slate-500 mt-1">
                      If any item is damaged or not fresh, return it instantly at your doorstep for
                      a full refund.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default ContactPage;
