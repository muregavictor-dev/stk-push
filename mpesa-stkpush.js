import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { phone } = req.body;
  const consumerKey = "tAnaAxV9y7AxfPFOifAYZyf7Vmvx6xeSHkgoF0fbSGYvJ6FK";
  const consumerSecret = "NCwEuRjDPYu484egtsXk3AzVTYpkM29z1dvMOogJxoOs6tZNGaEQV6RVXdfRrAHP";
  const shortcode = "174379";
  const passkey ="ME1y5rjZwqrWiY6E6BaI8mzuCaGM95jPdOH04hR5FchfXk9KanoU27c85mnmN+pUtug/yJI5VVGAb0Tlmvj/ZDe6vlq33njQ5fFXFHKctfzumsNx524C0yoH1NNPkATQSbJ2RjDN5TGF2EytFiTkgSp5+rvYvV4b8h6jOq+QBWjGyq4+glw2OdtKerJR09i/DmkEefbB7WG7Km8+HLYKCicZRrNAoK8cxCLenb2obCc3Ngbs94OtelUHXvYeHejk7eiVqS/yF/Uz7cbWf3ZMXlb3R1TAQmSRB8JyiuPmMbc/dk7kBIWXKnUIPTXCY9kx1vmBm1jPaLplbHnVuOG84Q==";

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const { data: tokenData } = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );

    const access_token = tokenData.access_token;
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const { data: stkData } = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: 10,
        PartyA: phone,
        PartyB: 174379,
        PhoneNumber: phone,
        CallBackURL: 'https://stk-push-phi.vercel.app/',
        AccountReference: 'MERISON',
        TransactionDesc: 'Payment for service'
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    res.status(200).json(stkData);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

