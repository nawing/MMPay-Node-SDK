const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3030;

app.use(bodyParser.json());

const { MMPaySDK } = require("../dist/cjs/index");
const MMPay = MMPaySDK({
  appId: "MMxxxxxxx",
  publishableKey: "pk_test_abcxxxxx",
  secretKey: "sk_test_abcxxxxx",
  apiBaseUrl: "https://xxxxxx"
});

app.post("/create-order", async (req, res) => {
  const { amount, items } = req.body;
  const orderId = ''; // GET YOUR ORDER ID FROM YOUR BIZ LOGIC
  const payload = {
    orderId,
    amount,
    currency,
    items,
  }
  let payResponse = await MMPay.pay(payload);
  res.status(200).json(payResponse);
});
// Validating Callback
app.post("/callback-mmpay", async (req, res) => {
  const incomingSignature = req.headers['x-mmpay-signature'];
  const incomingNonce = req.headers['x-mmpay-nonce'];

  const payloadString = JSON.stringify(req.body)

  console.log(payloadString)

  const cbResponse = await MMPay.verifyCb(payloadString, incomingNonce, incomingSignature);

  console.log(cbResponse)

  if (cbResponse) {
    const parsedPayload = JSON.parse(payloadString);
    if (parsedPayload.status === 'SUCCESS') {
      // SUCCESS LOGIC HERE
    }
    if (parsedPayload.status !== 'SUCCESS') {
      // NOT SUCCESS LOGIC HERE
    }
  }
  if (!cbResponse) {
    return res.status(500).json({ error: 'Callback Verification Fail' });
  }
  res.status(200).json({ message: "Success" });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
