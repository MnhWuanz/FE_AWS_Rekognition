export const postFaceCheck = async (base64) => {
  const res = await fetch(
    'https://dggnfsz809.execute-api.ap-southeast-1.amazonaws.com/prod/checkFaceImg',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64 }),
    }
  );
  return res.json(); // { valid: true/false, message: "..." }
};
