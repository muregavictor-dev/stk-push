const axios = require('axios');

module.exports = async (req, res) => {
    // Ensure the request method is POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { phone } = req.body; // Get the phone number from the request body

    // M-Pesa API credentials
    const consumerKey = 'YOUR_CONSUMER_KEY';
    const consumerSecret = 'YOUR_CONSUMER_SECRET';
    const shortcode = 'YOUR_SHORTCODE';
    const passkey = 'YOUR_PASSKEY';
    const lipaNaMpesaOnlineURL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'; // Change for live

    try {
        // Step 1: Get an access token
        const tokenResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            auth: {
                username: consumerKey,
                password: consumerSecret,
            },
        });

        const accessToken = tokenResponse.data.access_token;

        // Step 2: Prepare the STK Push request payload
        const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14); // Format timestamp as yyyyMMddHHmmss
        const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');

        const payload = {
            BusinessShortCode: shortcode,
            Password: password,
            LipaNaMpesaOnline: 'CustomerPayBillOnline',
            Amount: 10, // Payment amount (you can change this)
            PartyA: phone, // Phone number of the user
            PartyB: shortcode,
            PhoneNumber: phone,
            CallBackURL: 'https://yourdomain.com/callback', // Your callback URL for response
            AccountReference: 'MERISON', // Reference for the payment
            TransactionDesc: 'Payment for security services',
        };

        // Step 3: Initiate the STK Push request
        const stkPushResponse = await axios.post(lipaNaMpesaOnlineURL, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Send response to frontend
        res.status(200).json({ message: 'STK Push initiated. Check your phone for the payment prompt.' });
    } catch (error) {
        console.error('Error initiating STK Push:', error);
        res.status(500).json({ message: 'Error initiating payment. Please try again.' });
    }
};
