import nodemailer from 'nodemailer';

const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn(
      '⚠️ [sendEmail] EMAIL_USER or EMAIL_PASS environment variable is missing. Emails will not be dispatched.'
    );
    return null;
  }
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465',
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

/**
 * Core sendEmail 
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      return { success: false, message: 'Email transporter not configured.' };
    }

    const fromAddress = `"SupperShop" <${process.env.EMAIL_USER}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || 'Please view this email in an HTML-compatible email client.',
      html,
    });

    console.log(`✉️ Email successfully sent to ${to} [MessageId: ${info.messageId}]`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Invoice Template
 */
export const generateInvoiceHtml = (order) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const orderId = (order._id || order.orderId || 'PENDING').toString();
  const shortId = orderId.slice(-8).toUpperCase();
  const invoiceNumber = `INV-${shortId}`;

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US');

  const customerName =
    order.userName ||
    `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() ||
    'Valued Customer';

  const customerEmail = order.userEmail || '';
  const customerPhone = order.shippingAddress?.phone || 'N/A';

  const addressLine1 = [order.shippingAddress?.street, order.shippingAddress?.apartment]
    .filter(Boolean)
    .join(', ');
  const addressLine2 = [order.shippingAddress?.city, order.shippingAddress?.postalCode, order.shippingAddress?.country]
    .filter(Boolean)
    .join(', ');
  const fullAddress = [addressLine1, addressLine2].filter(Boolean).join('<br/>') || 'Address on file';

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.subtotal || 0);
  const shippingCost = Number(order.shippingCost || 0);
  const discount = Number(order.discount || 0);
  const tax = Number(order.tax || 0);
  const grandTotal = Number(order.grandTotal || 0);

  const paymentMethodLabel = (() => {
    const pm = (order.paymentMethod || '').toLowerCase();
    if (pm === 'cod') return 'Cash on Delivery (COD)';
    if (pm === 'card') return 'Credit / Debit Card';
    if (pm === 'mobile') {
      const prov = (order.mobileProvider || 'Mobile Banking').toUpperCase();
      return `Mobile Banking (${prov})`;
    }
    return order.paymentMethod || 'Standard Payment';
  })();

  const paymentStatus = order.paymentStatus || 'Pending Verification';
  const isPaid =
    paymentStatus.toLowerCase().includes('paid') ||
    paymentStatus.toLowerCase().includes('approved');

  // Build items rows
  const itemRowsHtml = items
    .map((item, index) => {
      const title = item.title || item.name || 'Product';
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.price || 0);
      const totalItemPrice = unitPrice * quantity;
      const unit = item.unit ? `<span style="color: #64748b; font-size: 11px;">(${item.unit})</span>` : '';
      const imageHtml =
        item.image && typeof item.image === 'string' && item.image.startsWith('http')
          ? `<img src="${item.image}" alt="${title}" width="42" height="42" style="width: 42px; height: 42px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; margin-right: 12px; display: inline-block; vertical-align: middle;" />`
          : `<div style="width: 42px; height: 42px; border-radius: 8px; background-color: #f1f5f9; border: 1px solid #e2e8f0; margin-right: 12px; display: inline-block; vertical-align: middle; text-align: center; line-height: 42px; font-size: 18px;">🛍️</div>`;

      return `
        <tr style="border-bottom: 1px solid #f1f5f9; background-color: ${index % 2 === 0 ? '#ffffff' : '#fafafa'};">
          <td style="padding: 12px 16px; font-size: 13px; color: #1e293b; vertical-align: middle;">
            <div style="display: flex; align-items: center;">
              ${imageHtml}
              <div style="display: inline-block; vertical-align: middle;">
                <strong style="color: #0f172a; font-size: 13px; display: block; line-height: 1.3;">${title}</strong>
                ${unit}
              </div>
            </div>
          </td>
          <td style="padding: 12px 16px; font-size: 13px; color: #475569; text-align: center; vertical-align: middle; font-weight: 600;">
            ${quantity}
          </td>
          <td style="padding: 12px 16px; font-size: 13px; color: #475569; text-align: right; vertical-align: middle;">
            $${unitPrice.toFixed(2)}
          </td>
          <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right; vertical-align: middle;">
            $${totalItemPrice.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${shortId} - SupperShop</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 640px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
    
    <!-- Top Header Banner -->
    <div style="background: linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%); padding: 32px 36px; color: #ffffff;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle;">
            <div style="display: inline-block;">
              <span style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: #ffffff; display: block;">
                🛒 SupperShop
              </span>
              <span style="font-size: 11px; color: #bae6fd; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">
                Official Store Invoice
              </span>
            </div>
          </td>
          <td style="text-align: right; vertical-align: middle;">
            <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.18); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.3);">
              <span style="font-size: 11px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                ${invoiceNumber}
              </span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Main Content Area -->
    <div style="padding: 32px 36px;">
      
      <!-- Greeting & Status Notice -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">
          Thank you for your order, ${customerName}!
        </h2>
        <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;">
          We have received your order. Below is your detailed invoice receipt. Our team is reviewing the order details and preparing your items for delivery.
        </p>
      </div>

      <!-- Invoice Details Cards (2-column layout) -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <tr>
          <!-- Billed & Shipped To -->
          <td style="width: 50%; vertical-align: top; padding-right: 12px;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
              <span style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">
                📍 Shipping & Contact
              </span>
              <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 4px;">
                ${customerName}
              </strong>
              <div style="font-size: 12px; color: #475569; line-height: 1.5;">
                ${fullAddress}<br/>
                <span style="color: #64748b;">Phone:</span> ${customerPhone}<br/>
                <span style="color: #64748b;">Email:</span> ${customerEmail}
              </div>
            </div>
          </td>

          <!-- Order Summary Meta -->
          <td style="width: 50%; vertical-align: top; padding-left: 12px;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
              <span style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">
                🧾 Order Details
              </span>
              <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <tr>
                  <td style="color: #64748b; padding-bottom: 4px;">Order Date:</td>
                  <td style="color: #0f172a; font-weight: 600; text-align: right; padding-bottom: 4px;">${orderDate}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-bottom: 4px;">Payment:</td>
                  <td style="color: #0f172a; font-weight: 600; text-align: right; padding-bottom: 4px;">${paymentMethodLabel}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-bottom: 4px;">Status:</td>
                  <td style="text-align: right; padding-bottom: 4px;">
                    <span style="display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background-color: ${isPaid ? '#ecfdf5' : '#fef3c7'}; color: ${isPaid ? '#047857' : '#b45309'}; border: 1px solid ${isPaid ? '#a7f3d0' : '#fde68a'};">
                      ${paymentStatus}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="color: #64748b;">Delivery:</td>
                  <td style="color: #0f172a; font-weight: 600; text-align: right; text-transform: capitalize;">
                    ${order.deliveryMethod || 'Standard'} Delivery
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>

      <!-- Items Table -->
      <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f1f5f9; text-transform: uppercase; font-size: 10px; font-weight: 800; color: #475569; letter-spacing: 0.5px;">
              <th style="padding: 12px 16px; text-align: left;">Item Description</th>
              <th style="padding: 12px 16px; text-align: center;">Qty</th>
              <th style="padding: 12px 16px; text-align: right;">Unit Price</th>
              <th style="padding: 12px 16px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRowsHtml}
          </tbody>
        </table>
      </div>

      <!-- Financial Calculation Summary -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 16px;">
            ${
              order.orderNotes
                ? `<div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 12px; font-size: 11px; color: #92400e;">
                     <strong>Customer Note:</strong> ${order.orderNotes}
                   </div>`
                : ''
            }
          </td>
          <td style="width: 50%; vertical-align: top;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
              <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <tr>
                  <td style="color: #64748b; padding-bottom: 6px;">Subtotal:</td>
                  <td style="color: #0f172a; font-weight: 600; text-align: right; padding-bottom: 6px;">$${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-bottom: 6px;">Shipping Fee:</td>
                  <td style="color: #0f172a; font-weight: 600; text-align: right; padding-bottom: 6px;">
                    ${shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : '<span style="color: #059669; font-weight: 700;">FREE</span>'}
                  </td>
                </tr>
                ${
                  discount > 0
                    ? `<tr>
                         <td style="color: #e11d48; padding-bottom: 6px;">Discount:</td>
                         <td style="color: #e11d48; font-weight: 700; text-align: right; padding-bottom: 6px;">-$${discount.toFixed(2)}</td>
                       </tr>`
                    : ''
                }
                ${
                  tax > 0
                    ? `<tr>
                         <td style="color: #64748b; padding-bottom: 6px;">Estimated Tax:</td>
                         <td style="color: #0f172a; font-weight: 600; text-align: right; padding-bottom: 6px;">$${tax.toFixed(2)}</td>
                       </tr>`
                    : ''
                }
                <tr style="border-top: 2px dashed #cbd5e1;">
                  <td style="padding-top: 10px; font-size: 14px; font-weight: 800; color: #0f172a;">Grand Total:</td>
                  <td style="padding-top: 10px; font-size: 18px; font-weight: 900; color: #0284c7; text-align: right;">
                    $${grandTotal.toFixed(2)}
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>

      <!-- Track Order CTA Button -->
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
          Track Your Order in Dashboard →
        </a>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
          You can also view your live order tracking at any time from your SupperShop account.
        </p>
      </div>

    </div>

    <!-- Footer Area -->
    <div style="background-color: #f1f5f9; padding: 24px 36px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">
        Need Help or Have Questions?
      </p>
      <p style="margin: 0 0 12px 0;">
        Contact our 24/7 support team anytime at <a href="mailto:${process.env.EMAIL_USER}" style="color: #0284c7; text-decoration: underline;">${process.env.EMAIL_USER}</a> or visit our Help Center.
      </p>
      <div style="color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        © ${new Date().getFullYear()} SupperShop Inc. All rights reserved. • High Quality Groceries & Essentials Delivered.
      </div>
    </div>

  </div>
</body>
</html>
  `;
};

/**
 * Order Confirmation
 */
export const generateApprovalHtml = (order) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const orderId = (order._id || order.orderId || 'PENDING').toString();
  const shortId = orderId.slice(-8).toUpperCase();

  const customerName =
    order.userName ||
    `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() ||
    'Valued Customer';

  const grandTotal = Number(order.grandTotal || 0);
  const items = Array.isArray(order.items) ? order.items : [];

  const addressLine1 = [order.shippingAddress?.street, order.shippingAddress?.apartment]
    .filter(Boolean)
    .join(', ');
  const addressLine2 = [order.shippingAddress?.city, order.shippingAddress?.postalCode]
    .filter(Boolean)
    .join(', ');
  const fullAddress = [addressLine1, addressLine2].filter(Boolean).join(', ') || 'Address on file';

  const itemsPreview = items
    .slice(0, 4)
    .map((item) => {
      const title = item.title || item.name || 'Product';
      const quantity = Number(item.quantity || 1);
      return `
        <li style="margin-bottom: 6px; font-size: 13px; color: #334155;">
          <strong>${quantity}x</strong> ${title}
        </li>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Approved - SupperShop</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
    
    <!-- Top Celebratory Banner -->
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #0284c7 100%); padding: 36px 36px; color: #ffffff; text-align: center;">
      <div style="font-size: 44px; margin-bottom: 8px;">🎉</div>
      <h1 style="font-size: 22px; font-weight: 900; margin: 0 0 6px 0; color: #ffffff; letter-spacing: -0.3px;">
        Order Approved & Confirmed!
      </h1>
      <p style="font-size: 13px; color: #d1fae5; margin: 0; font-weight: 500;">
        Order #${shortId} has been verified and approved by the SupperShop team.
      </p>
    </div>

    <!-- Main Content Area -->
    <div style="padding: 32px 36px;">
      
      <p style="font-size: 14px; color: #1e293b; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${customerName}</strong>,<br/>
        Great news! Your payment and order details have been successfully verified and approved by our store administrator. Your items are now being carefully packed and prepared for dispatch.
      </p>

      <!-- Order Progress Timeline -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
        <span style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 14px;">
          📦 Order Fulfillment Stage
        </span>
        <table style="width: 100%; text-align: center; font-size: 11px; border-collapse: collapse;">
          <tr>
            <td style="width: 25%; color: #059669; font-weight: 700;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #059669; color: #ffffff; line-height: 26px; margin: 0 auto 6px auto; font-size: 12px;">✓</div>
              Placed
            </td>
            <td style="width: 25%; color: #059669; font-weight: 700;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #059669; color: #ffffff; line-height: 26px; margin: 0 auto 6px auto; font-size: 12px;">✓</div>
              Approved
            </td>
            <td style="width: 25%; color: #0284c7; font-weight: 700;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #0284c7; color: #ffffff; line-height: 26px; margin: 0 auto 6px auto; font-size: 12px; animation: pulse 2s infinite;">🚚</div>
              Packing & Shipping
            </td>
            <td style="width: 25%; color: #94a3b8; font-weight: 500;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #e2e8f0; color: #64748b; line-height: 26px; margin: 0 auto 6px auto; font-size: 12px;">🏠</div>
              Delivered
            </td>
          </tr>
        </table>
      </div>

      <!-- Quick Summary Card -->
      <div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
          Order Overview
        </h3>
        <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 12px;">
          <tr>
            <td style="color: #64748b; padding-bottom: 6px;">Order ID:</td>
            <td style="color: #0f172a; font-weight: 700; text-align: right; padding-bottom: 6px;">#${shortId}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px;">Delivery Destination:</td>
            <td style="color: #0f172a; font-weight: 600; text-align: right; padding-bottom: 6px;">${fullAddress}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px;">Total Amount:</td>
            <td style="color: #059669; font-weight: 800; font-size: 14px; text-align: right; padding-bottom: 6px;">$${grandTotal.toFixed(2)}</td>
          </tr>
        </table>

        ${
          items.length > 0
            ? `<div style="border-top: 1px dashed #cbd5e1; padding-top: 12px;">
                 <span style="font-size: 11px; font-weight: 700; color: #64748b; display: block; margin-bottom: 6px;">Purchased Items:</span>
                 <ul style="margin: 0; padding-left: 18px;">
                   ${itemsPreview}
                 </ul>
                 ${items.length > 4 ? `<span style="font-size: 11px; color: #94a3b8; margin-top: 4px; display: block;">+ ${items.length - 4} more items</span>` : ''}
               </div>`
            : ''
        }
      </div>

      <!-- Call to Action -->
      <div style="text-align: center; margin: 30px 0 10px 0;">
        <a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);">
          Track Your Live Delivery →
        </a>
      </div>

    </div>

    <!-- Footer Area -->
    <div style="background-color: #f1f5f9; padding: 22px 36px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
      <p style="margin: 0 0 6px 0;">
        Questions about your shipment? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #059669; text-decoration: underline;">${process.env.EMAIL_USER}</a>
      </p>
      <div style="color: #94a3b8; font-size: 10px; margin-top: 8px;">
        © ${new Date().getFullYear()} SupperShop. Safe, fast, and verified delivery.
      </div>
    </div>

  </div>
</body>
</html>
  `;
};

/**
 * Send Order Invoice Email
 */
export const sendOrderInvoiceEmail = async (order) => {
  if (!order || !order.userEmail) {
    console.warn('[sendOrderInvoiceEmail] Invalid order or missing userEmail.');
    return { success: false, message: 'Missing user email.' };
  }

  const orderId = (order._id || order.orderId || '').toString();
  const shortId = orderId.slice(-8).toUpperCase();
  const subject = `🛒 Order Invoice & Receipt #${shortId} - SupperShop`;
  const html = generateInvoiceHtml(order);

  // 1. Send primary invoice to customer's 
  const result = await sendEmail({
    to: order.userEmail,
    subject,
    html,
    text: `Thank you for your order with SupperShop! Your Invoice #${shortId} has been generated. Total: $${Number(order.grandTotal || 0).toFixed(2)}.`,
  });

  // 2. If the user changed the email from their logged-in account email, also send a copy to their account email
  if (order.accountEmail && order.accountEmail.toLowerCase() !== order.userEmail.toLowerCase()) {
    sendEmail({
      to: order.accountEmail,
      subject: `[Order Receipt Copy] #${shortId} - SupperShop`,
      html,
      text: `An order #${shortId} was placed under your account. Invoice has been sent to ${order.userEmail}.`,
    }).catch((err) => console.error('[sendOrderInvoiceEmail] Copy to accountEmail failed:', err));
  }

  return result;
};

/**
 *  Send Order Approval & Confirmation Email
 */
export const sendOrderApprovalEmail = async (order) => {
  if (!order || !order.userEmail) {
    console.warn('[sendOrderApprovalEmail] Invalid order or missing userEmail.');
    return { success: false, message: 'Missing user email.' };
  }

  const orderId = (order._id || order.orderId || '').toString();
  const shortId = orderId.slice(-8).toUpperCase();
  const subject = `🎉 Order Approved & Confirmed! #${shortId} - SupperShop`;
  const html = generateApprovalHtml(order);

  const result = await sendEmail({
    to: order.userEmail,
    subject,
    html,
    text: `Great news! Your SupperShop order #${shortId} has been approved by our team and is now being prepared for shipping!`,
  });

  // Also notify account email if different
  if (order.accountEmail && order.accountEmail.toLowerCase() !== order.userEmail.toLowerCase()) {
    sendEmail({
      to: order.accountEmail,
      subject: `🎉 Order Approved & Confirmed! #${shortId} - SupperShop`,
      html,
      text: `Great news! Your SupperShop order #${shortId} has been approved by our team!`,
    }).catch((err) => console.error('[sendOrderApprovalEmail] Copy to accountEmail failed:', err));
  }

  return result;
};

