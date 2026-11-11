const storeId = process.env.SSLCOMMERZ_STORE_ID || 'testbox';
const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD || 'qwerty';
const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';

const SSLCOMMERZ_URL = isLive
  ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
  : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

const SSLCOMMERZ_VALIDATION_URL = isLive
  ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

export const initSSLCommerzPayment = async (paymentData) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const tranId = paymentData.tranId || `TXN_${Date.now()}`;

    const formData = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePasswd,
      total_amount: paymentData.amount.toString(),
      currency: paymentData.currency || 'BDT',
      tran_id: tranId,
      success_url: `${baseUrl}/api/payment/sslcommerz/success?tran_id=${tranId}`,
      fail_url: `${baseUrl}/api/payment/sslcommerz/fail?tran_id=${tranId}`,
      cancel_url: `${baseUrl}/api/payment/sslcommerz/cancel?tran_id=${tranId}`,
      ipn_url: `${baseUrl}/api/payment/sslcommerz/ipn`,
      shipping_method: 'Courier',
      product_name: paymentData.productName || 'SuperShop Order Items',
      product_category: 'General',
      product_profile: 'general',
      cus_name: paymentData.customerName || 'Customer',
      cus_email: paymentData.customerEmail || 'customer@example.com',
      cus_add1: paymentData.address || 'Dhaka, Bangladesh',
      cus_city: paymentData.city || 'Dhaka',
      cus_postcode: paymentData.postalCode || '1200',
      cus_country: 'Bangladesh',
      cus_phone: paymentData.customerPhone || '01700000000',
      ship_name: paymentData.customerName || 'Customer',
      ship_add1: paymentData.address || 'Dhaka, Bangladesh',
      ship_city: paymentData.city || 'Dhaka',
      ship_postcode: paymentData.postalCode || '1200',
      ship_country: 'Bangladesh',
    });

    const response = await fetch(SSLCOMMERZ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data?.status === 'SUCCESS' && data?.GatewayPageURL) {
      return {
        success: true,
        gatewayUrl: data.GatewayPageURL,
        tranId,
      };
    } else {
      console.error('SSLCommerz session init error:', data);
      return {
        success: false,
        message: data?.failedreason || 'Failed to initialize payment gateway',
      };
    }
  } catch (error) {
    console.error('SSLCommerz initiation error:', error);
    return {
      success: false,
      message: error.message || 'Error communicating with payment gateway',
    };
  }
};

