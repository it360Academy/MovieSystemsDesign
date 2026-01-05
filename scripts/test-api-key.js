// Quick test script to validate OpenAI API key
const OpenAI = require('openai');
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY not set');
  console.log('\nTo set it:');
  console.log('  PowerShell: $env:OPENAI_API_KEY="your_key"');
  console.log('  CMD: set OPENAI_API_KEY=your_key');
  process.exit(1);
}

const cleanedKey = apiKey.trim().replace(/^["']|["']$/g, '');
console.log(`Testing API key (length: ${cleanedKey.length})...`);
console.log(`Preview: ${cleanedKey.substring(0, 7)}...${cleanedKey.substring(cleanedKey.length - 4)}`);

if (!cleanedKey.startsWith('sk-')) {
  console.warn('⚠ Warning: API key should start with "sk-"');
}

const client = new OpenAI({ apiKey: cleanedKey });

(async () => {
  try {
    console.log('\nTesting API key with OpenAI...');
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say "test" and nothing else.' }],
      max_tokens: 5
    });
    console.log('✅ API key is VALID!');
    console.log(`Response: ${response.choices[0].message.content}`);
  } catch (error) {
    const errMsg = String(error);
    if (errMsg.includes('401') || errMsg.toLowerCase().includes('incorrect api key')) {
      console.error('\n❌ API key is INVALID (401)');
      console.error('\nPossible issues:');
      console.error('  1. API key is incorrect or expired');
      console.error('  2. API key was revoked');
      console.error('  3. API key has wrong format');
      console.error('\nGet a new key at: https://platform.openai.com/api-keys');
    } else if (errMsg.includes('429')) {
      console.error('\n❌ Quota exceeded (429)');
      console.error('Check your OpenAI account billing at: https://platform.openai.com/account/billing');
    } else {
      console.error('\n❌ Error:', error.message);
    }
    process.exit(1);
  }
})();

