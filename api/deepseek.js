// DeepSeek API konfiguratsiyasy
const DEEPSEEK_CONFIG = {
    apiKey: 'sk-fe7af9313d814884b58cd49eac0756ca', // DeepSeek API kilti
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000
};

// DOM elementteri
const form = document.getElementById('lessonForm');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const resultContent = document.getElementById('resultContent');
const errorDiv = document.getElementById('error');
const generateBtn = document.getElementById('generateBtn');

// Form zhiberu
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const classLevel = document.getElementById('classLevel').value;
    const subject = document.getElementById('subject').value;
    const topic = document.getElementById('topic').value;
    const objectives = document.getElementById('objectives').value;

    if (!classLevel || !subject || !topic) {
        showError('Barliq mindetti orislerdi toltyrinyz');
        return;
    }

    loading.classList.add('show');
    result.classList.remove('show');
    errorDiv.classList.remove('show');
    generateBtn.disabled = true;

    try {
        const lessonPlan = await generateLessonPlan(classLevel, subject, topic, objectives);
        resultContent.innerHTML = lessonPlan;
        result.classList.add('show');
    } catch (error) {
        console.error('Qate:', error);
        showError('Qate payda boldy. Qaytalap koriniz.');
    } finally {
        loading.classList.remove('show');
        generateBtn.disabled = false;
    }
});

// Sabaq zhosparyn generatsiyalau
async function generateLessonPlan(classLevel, subject, topic, objectives) {
    const prompt = createPrompt(classLevel, subject, topic, objectives);

    try {
        const response = await fetch(DEEPSEEK_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + DEEPSEEK_CONFIG.apiKey
            },
            body: JSON.stringify({
                model: DEEPSEEK_CONFIG.model,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: DEEPSEEK_CONFIG.temperature,
                max_tokens: DEEPSEEK_CONFIG.maxTokens
            })
        });

        if (!response.ok) {
            throw new Error('API qatesi: ' + response.status);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0]) {
            throw new Error('Zhaiapta mazmun zhoq');
        }
        
        return data.choices[0].message.content;

    } catch (error) {
        console.error('DeepSeek API qatesi:', error);
        throw error;
    }
}

// Prompt quru
function createPrompt(classLevel, subject, topic, objectives) {
    return `Qazaqstan bilim beru standarttary boyinsha ${classLevel} synypqa "${subject}" paninen "${topic}" taqyryby boyinsha qysqa merzimdi zhospar (QMZh) qurastyр.

${objectives ? 'Oqu maqsattary: ' + objectives : ''}

QMZh myna qurylymda bol:

<h3>Zhalpу maliметтер</h3>
<p><strong>Pan:</strong> ${subject}</p>
<p><strong>Synyp:</strong> ${classLevel}</p>
<p><strong>Taqyryp:</strong> ${topic}</p>
<p><strong>Kuni:</strong> ${new Date().toLocaleDateString('kk-KZ')}</p>

<h3>Sabaqtyn maqsaty</h3>
<p>[Sabaqtyn negizgi oqu maqsattary]</p>

<h3>Sabaq barysy</h3>
<p><strong>1. Uyimdastуru kezeni (5 minut)</strong></p>
<ul>
<li>[Salemdesu, tugendeu]</li>
<li>[Sabaqqa dayyndyq]</li>
</ul>

<p><strong>2. Ui tapsyrmasyn tekseru (10 minut)</strong></p>
<ul>
<li>[Otken taqyrypty qaytalau]</li>
<li>[Ui tapsyrmasyn taldau]</li>
</ul>

<p><strong>3. Zhana taqyryp (15 minut)</strong></p>
<ul>
<li>[Zhana materiаldy tusindiru]</li>
<li>[Mysaldar keltiru]</li>
</ul>

<p><strong>4. Bekitu zhattyguulary (10 minut)</strong></p>
<ul>
<li>[Praktikalyq tapsyrmalar]</li>
</ul>

<p><strong>5. Qorytyndy (5 minut)</strong></p>
<ul>
<li>[Sabaqty qorytyndylau]</li>
<li>[Ui tapsyrmasyn beru]</li>
</ul>

<h3>Bagalau kriteriyileri</h3>
<ul>
<li>[1-kriteriy]</li>
<li>[2-kriteriy]</li>
<li>[3-kriteriy]</li>
</ul>

<h3>Qazhetti resurslar</h3>
<p>[Oqulyqtar, kornekіlikter, t.b.]</p>

TEK zhogaryda korsетilgen HTML tegterіn payдаlan. Qazaq tilinde zhаz.`;
}

// Qate habarlаmasyn korsetu
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    setTimeout(function() {
        errorDiv.classList.remove('show');
    }, 5000);
}

// PDF zhukteu
function downloadPDF() {
    const content = resultContent.innerHTML;

    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Sabaq zhospary</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 40px; 
                    line-height: 1.8; 
                }
                h1 { 
                    text-align: center; 
                    color: #667eea; 
                    margin-bottom: 30px;
                }
                h3 { 
                    color: #764ba2; 
                    margin-top: 25px; 
                    margin-bottom: 15px;
                }
                p { margin: 10px 0; }
                ul { 
                    margin: 10px 0; 
                    padding-left: 30px; 
                }
                li { margin: 5px 0; }
            </style>
        </head>
        <body>
            <h1>QYSQA MERZIMDI ZHOSPAR</h1>
            ${content}
            <p style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
                Generatsiyalangan kuni: ${new Date().toLocaleString('kk-KZ')}
            </p>
        </body>
        </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
}
