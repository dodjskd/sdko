export default async function handler(req, res) {
  const { subject, grade, topic } = req.body;

  const prompt = `
Пән: ${subject}
Сынып: ${grade}
Тақырып: ${topic}

Маған қысқа, нақты, стандартқа сай ҚМЖ жасап бер.
`;

  const deepseek = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_API_KEY"
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await deepseek.json();
  const result = data.choices[0].message.content;

  res.status(200).json({ result });
}
