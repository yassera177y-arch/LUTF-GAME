// استيراد مكتبات Firebase عبر روابط مباشرة (CDN) لتعمل على الآيباد فوراً
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// بيانات الربط الخاصة بمشروعك LUTF GAME مأخوذة بدقة من صورتك
const firebaseConfig = {
  apiKey: "AIzaSyAIweAqiVcAV2XDFhx2Wsf12V-moRTAujM",
  authDomain: "lutf-game-qa.firebaseapp.com",
  projectId: "lutf-game-qa",
  storageBucket: "lutf-game-qa.firebasestorage.app",
  messagingSenderId: "340099124621",
  appId: "1:340099124621:web:1d818c75ae610ba59001c4",
  measurementId: "G-ETPL088DK1"
};

// تهيئة وتشغيل الـ Firebase وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ربط عناصر واجهة الموقع بالكود البرمجي
const questionInput = document.getElementById('questionInput');
const addQuestionBtn = document.getElementById('addQuestionBtn');
const questionsContainer = document.getElementById('questionsContainer');

// 1. وظيفة نشر سؤال جديد وحفظه في قاعدة البيانات
addQuestionBtn.addEventListener('click', async () => {
    const questionText = questionInput.value.trim();
    
    if (questionText === "") {
        alert("الرجاء كتابة سؤال أولاً!");
        return;
    }

    try {
        // حفظ السؤال في قائمة (مجموعة) اسمها questions
        await addDoc(collection(db, "questions"), {
            text: questionText,
            answers: [], // مصفوفة فارغة للإجابات المستقبلية
            timestamp: new Date()
        });
        questionInput.value = ""; // تفريغ الخانة بعد النشر بنجاح
    } catch (error) {
        console.error("خطأ في نشر السؤال: ", error);
    }
});

// 2. وظيفة جلب الأسئلة وعرضها وتحديثها تلقائياً (Live Update)
onSnapshot(collection(db, "questions"), (snapshot) => {
    questionsContainer.innerHTML = ""; // مسح النص القديم
    
    if (snapshot.empty) {
        questionsContainer.innerHTML = '<p class="loading-text">لا توجد أسئلة حالياً. كن أول من يسأل!</p>';
        return;
    }

    // ترتيب الأسئلة بحيث يظهر السؤال الأحدث فوق
    const docs = snapshot.docs.sort((a, b) => b.data().timestamp - a.data().timestamp);

    docs.forEach((docSnap) => {
        const questionData = docSnap.data();
        const questionId = docSnap.id;

        // إنشاء بطاقة السؤال
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';

        // تجهيز الإجابات إذا كانت موجودة
        let answersHtml = '';
        if (questionData.answers && questionData.answers.length > 0) {
            questionData.answers.forEach(ans => {
                answersHtml += `<div class="answer-item">💡 ${ans}</div>`;
            });
        } else {
            answersHtml = `<p class="no-answers">لا توجد إجابات بعد.</p>`;
        }

        // تركيب تصميم السؤال وخانة الإجابة عليه
        questionCard.innerHTML = `
            <div class="question-text">❓ ${questionData.text}</div>
            <div class="answers-box">
                ${answersHtml}
            </div>
            <div class="answer-form">
                <input type="text" id="input-${questionId}" class="answer-input" placeholder="اكتب إجابتك هنا...">
                <button class="reply-btn" onclick="window.submitAnswer('${questionId}')">إجابة</button>
            </div>
        `;

        questionsContainer.appendChild(questionCard);
    });
});

// 3. وظيفة إرسال إجابة على سؤال محدد وحفظها
window.submitAnswer = async (questionId) => {
    const answerInput = document.getElementById(`input-${questionId}`);
    const answerText = answerInput.value.trim();

    if (answerText === "") {
        alert("الرجاء كتابة إجابة أولاً!");
        return;
    }

    try {
        const questionRef = doc(db, "questions", questionId);
        // إضافة الإجابة الجديدة إلى مصفوفة الإجابات داخل فايربيس
        await updateDoc(questionRef, {
            answers: arrayUnion(answerText)
        });
        answerInput.value = ""; // تفريغ خانة الإجابة بعد النشر
    } catch (error) {
        console.error("خطأ في إضافة الإجابة: ", error);
    }
};
