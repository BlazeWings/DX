// 题目数据存储
let allQuestions = {
    '判断题': [],
    '单选题': [],
    '多选题': [],
    '填空题': []
};

let currentTraining = [];
let currentIndex = 0;
let userAnswers = [];

// 加载JSON文件
async function loadQuestions() {
    try {
        // 注意：这里假设你的JSON文件和HTML文件在同一目录下
        const response1 = await fetch('判断题.json');
        allQuestions['判断题'] = await response1.json();
        
        const response2 = await fetch('单选题.json');
        allQuestions['单选题'] = await response2.json();
        
        const response3 = await fetch('多选题.json');
        allQuestions['多选题'] = await response3.json();
        
        const response4 = await fetch('填空题.json');
        allQuestions['填空题'] = await response4.json();
        
        console.log('题目加载成功！');
    } catch (error) {
        console.error('加载题目失败:', error);
        alert('加载题目失败，请检查JSON文件是否已上传！');
    }
}

// 显示所有题目
async function showAllQuestions() {
    await loadQuestions();
    
    const display = document.getElementById('question-display');
    display.innerHTML = '';
    
    for (let [type, questions] of Object.entries(allQuestions)) {
        const section = document.createElement('div');
        section.className = 'question-section';
        section.innerHTML = `<h2>${type}（共${questions.length}题）</h2>`;
        
        questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            
            let content = `<strong>题号：${q.题号}</strong><br>`;
            content += `<p>${q.题目}</p>`;
            
            if (type === '单选题' || type === '多选题') {
                content += '<div class="options">';
                for (let [key, value] of Object.entries(q.选项)) {
                    content += `<label><input type="${type === '单选题' ? 'radio' : 'checkbox'}" name="q${q.题号}"> ${key}: ${value}</label><br>`;
                }
                content += '</div>';
            }
            
            content += `<p class="answer"><strong>正确答案：</strong>${q.正确答案}</p>`;
            questionDiv.innerHTML = content;
            section.appendChild(questionDiv);
        });
        
        display.appendChild(section);
    }
}

// 开始专项训练
async function startTraining(type) {
    await loadQuestions();
    
    const questions = allQuestions[type];
    if (questions.length === 0) {
        alert('该类型题目暂无数据！');
        return;
    }
    
    // 随机抽取10题或全部
    currentTraining = questions.sort(() => Math.random() - 0.5).slice(0, Math.min(10, questions.length));
    currentIndex = 0;
    userAnswers = [];
    
    document.querySelector('.training-setup').style.display = 'none';
    document.getElementById('training-area').style.display = 'block';
    document.getElementById('total-num').textContent = currentTraining.length;
    
    showQuestion();
}

// 显示题目
function showQuestion() {
    const q = currentTraining[currentIndex];
    const contentDiv = document.getElementById('question-content');
    const answerDiv = document.getElementById('answer-section');
    
    document.getElementById('current-num').textContent = currentIndex + 1;
    
    let html = `<h3>题号：${q.题号}</h3>`;
    html += `<p>${q.题目}</p>`;
    contentDiv.innerHTML = html;
    
    // 根据题型显示答题界面
    if (currentTraining === allQuestions['判断题']) {
        answerDiv.innerHTML = `
            <label><input type="radio" name="answer" value="对"> 对</label>
            <label><input type="radio" name="answer" value="错"> 错</label>
        `;
    } else if (currentTraining === allQuestions['单选题']) {
        let optionsHtml = '<div class="options">';
        for (let [key, value] of Object.entries(q.选项)) {
            optionsHtml += `<label><input type="radio" name="answer" value="${key}"> ${key}: ${value}</label><br>`;
        }
        optionsHtml += '</div>';
        answerDiv.innerHTML = optionsHtml;
    } else if (currentTraining === allQuestions['多选题']) {
        let optionsHtml = '<div class="options">';
        for (let [key, value] of Object.entries(q.选项)) {
            optionsHtml += `<label><input type="checkbox" name="answer" value="${key}"> ${key}: ${value}</label><br>`;
        }
        optionsHtml += '</div>';
        answerDiv.innerHTML = optionsHtml;
    } else if (currentTraining === allQuestions['填空题']) {
        answerDiv.innerHTML = `<input type="text" id="fill-answer" placeholder="请输入答案" style="width: 100%; padding: 10px;">`;
    }
    
    // 重置按钮
    document.getElementById('submit-btn').style.display = 'inline-block';
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('result-display').innerHTML = '';
}

// 检查答案
function checkAnswer() {
    const q = currentTraining[currentIndex];
    let userAnswer;
    
    if (currentTraining === allQuestions['多选题']) {
        const checkboxes = document.querySelectorAll('input[name="answer"]:checked');
        userAnswer = Array.from(checkboxes).map(cb => cb.value).sort().join('');
    } else if (currentTraining === allQuestions['填空题']) {
        userAnswer = document.getElementById('fill-answer').value.trim();
    } else {
        const selected = document.querySelector('input[name="answer"]:checked');
        userAnswer = selected ? selected.value : '';
    }
    
    if (!userAnswer) {
        alert('请选择或输入答案！');
        return;
    }
    
    userAnswers[currentIndex] = userAnswer;
    const correct = q.正确答案;
    const isCorrect = userAnswer === correct;
    
    const resultDiv = document.getElementById('result-display');
    resultDiv.innerHTML = `
        <p class="${isCorrect ? 'correct' : 'incorrect'}">
            ${isCorrect ? '✅ 回答正确！' : '❌ 回答错误！'}
        </p>
        <p><strong>正确答案：</strong>${correct}</p>
    `;
    
    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'inline-block';
}

// 下一题
function nextQuestion() {
    currentIndex++;
    if (currentIndex < currentTraining.length) {
        showQuestion();
    } else {
        // 显示最终结果
        showFinalResult();
    }
}

// 显示最终结果
function showFinalResult() {
    const total = currentTraining.length;
    let correct = 0;
    
    currentTraining.forEach((q, index) => {
        if (userAnswers[index] === q.正确答案) correct++;
    });
    
    const contentDiv = document.getElementById('question-content');
    const answerDiv = document.getElementById('answer-section');
    
    contentDiv.innerHTML = `
        <h2>🎉 训练完成！</h2>
        <p>总题数：${total}</p>
        <p>正确数：${correct}</p>
        <p>得分：${Math.round(correct / total * 100)}分</p>
    `;
    
    answerDiv.innerHTML = '';
    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    
    // 显示每题对错
    const resultDiv = document.getElementById('result-display');
    let details = '<h3>答题详情：</h3>';
    currentTraining.forEach((q, index) => {
        const isCorrect = userAnswers[index] === q.正确答案;
        details += `<p class="${isCorrect ? 'correct' : 'incorrect'}">
            题号${q.题号}: ${isCorrect ? '✓' : '✗'} 你的答案：${userAnswers[index]} | 正确答案：${q.正确答案}
        </p>`;
    });
    resultDiv.innerHTML = details;
}
