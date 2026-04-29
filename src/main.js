import './style.css'

// Import Sharingan Images
import tomoe1 from './assets/sharingan_1.png'
import tomoe2 from './assets/sharingane_2.png' // Tên gốc của bạn có chữ "e", giữ nguyên để khớp file
import tomoe3 from './assets/sharingan_3.png'
import mangekyou from './assets/itachi_sharingan.png'

// --- CẬP NHẬT SOUND ASSETS MỚI ---
import sharinganBeginSfx from './assets/sharingan_begin.mp3'
import focusSfx from './assets/focus_music.mp3'
import sharinganEndSfx from './assets/end_sharingan.mp3'
import breakSfx from './assets/break_music.mp3'
import session4KeepGoingSfx from './assets/Session_4_Keepgoing.mp3'
import chidoriSfx from './assets/chidorisound.mp3'
import ss1Sfx from './assets/Session_1_Keepgoing.mp3'
import ss2Sfx from './assets/Session_2_Keepgoing.mp3'
import ss3Sfx from './assets/Session_3_Keepgoing.mp3'
import break1Sfx from './assets/Break_1.mp3'

// Cấu hình hằng số (Giữ nguyên 10s/5s để bạn test nhanh)
const FOCUS_TIME = 10;
const BREAK_TIME = 5;

// Khởi tạo trạng thái
let timeLeft = FOCUS_TIME; 
let timerId = null;
let isRunning = false;
let currentMode = 'FOCUS'; 
let sessionCount = 1;

// --- KHỞI TẠO AUDIO OBJECTS ---
const audioBegin = new Audio(sharinganBeginSfx);
const audioFocus = new Audio(focusSfx);
audioFocus.loop = true;

const audioEnd = new Audio(sharinganEndSfx);
const audioBreak = new Audio(breakSfx);
audioBreak.loop = true;

const audioKeepGoing = new Audio(session4KeepGoingSfx);
const audioChidori = new Audio(chidoriSfx);
audioChidori.loop = true;
audioChidori.volume = 0.3;

const audioSS1 = new Audio(ss1Sfx);
const audioSS2 = new Audio(ss2Sfx);
const audioSS3 = new Audio(ss3Sfx);
const audioBreak1 = new Audio(break1Sfx);

// Lưu vào mảng để dễ gọi theo Round bằng Index
const keepGoingAudios = [audioSS1, audioSS2, audioSS3];

// Truy vấn DOM
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const sharingan = document.getElementById('sharingan');
const chidoriVideo = document.getElementById('chidori-bg');
const segments = document.querySelectorAll('.battery-segment');

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalTime = currentMode === 'FOCUS' ? FOCUS_TIME : BREAK_TIME;
  const perSegment = totalTime / 4;

  segments.forEach((s, i) => {
    s.style.visibility = timeLeft > perSegment * (3 - i) ? 'visible' : 'hidden';
  });
}

function updateSharinganVisuals() {
  sharingan.classList.remove('normal-spin', 'mangekyou-spin');
  
  if (currentMode === 'BREAK') {
    sharingan.style.backgroundImage = "none";
    sharingan.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
    return;
  }

  let currentImg;
  switch(sessionCount) {
    case 1: currentImg = tomoe1; break;
    case 2: currentImg = tomoe2; break;
    case 3: currentImg = tomoe3; break;
    case 4: currentImg = mangekyou; break;
    default: currentImg = tomoe1;
  }
  
  sharingan.style.backgroundImage = `url(${currentImg})`;
  sharingan.style.backgroundColor = "transparent";

  if (sessionCount === 4) {
    sharingan.classList.add('mangekyou-spin');
  } else {
    sharingan.classList.add('normal-spin');
  }
}

// --- HÀM HỖ TRỢ PHÁT NHẠC AN TOÀN ---
// Giúp bắt lỗi (catch error) khi trình duyệt chặn auto-play, tránh báo lỗi văng màn hình
function safePlay(audioObj) {
  if (audioObj) {
    audioObj.play().catch(e => console.log("Audio play interrupted/prevented by browser"));
  }
}

// --- LOGIC DỪNG TOÀN BỘ ÂM THANH ---
function stopAllAudio() {
  const allAudios = [
    audioFocus, audioBreak, audioChidori, audioBegin, audioEnd, audioKeepGoing,
    audioSS1, audioSS2, audioSS3, audioBreak1
  ];
  allAudios.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
    // QUAN TRỌNG: Dọn dẹp sự kiện cũ để tránh chạy chồng chéo khi đổi session
    audio.onended = null; 
  });
}

function switchMode() {
  stopAllAudio(); // Dừng âm thanh cũ trước khi đổi mode

  if (currentMode === 'FOCUS') {
    if (sessionCount >= 4) {
      alert("Nhiệm vụ hoàn tất! Mangekyou cần nghỉ ngơi.");
      resetTimer();
      return;
    }
    currentMode = 'BREAK';
    timeLeft = BREAK_TIME;
    safePlay(audioEnd); // Âm thanh kết thúc Sharingan
  } else {
    currentMode = 'FOCUS';
    timeLeft = FOCUS_TIME;
    sessionCount++;
  }
  
  updateSharinganVisuals();
  updateDisplay();
  
  // Tự động start sau khi switch
  setTimeout(() => {
    startTimer();
  }, 500); 
}

function startTimer() {
  if (isRunning) return;
  
  isRunning = true;
  startBtn.textContent = currentMode === 'FOCUS' ? "KEEP GOING" : "RECOVERING";

  if (currentMode === 'FOCUS') {
    if (chidoriVideo) {
      chidoriVideo.play().catch(e => console.log("Video prevented"));
    }
    
    if (sessionCount < 4) {
      // Gọi audio từ mảng: Session 1 lấy index 0, Session 2 lấy index 1...
      let currentKeepGoingAudio = keepGoingAudios[sessionCount - 1];

      // Chuỗi phát: Keepgoing Audio -> Sharingan Begin -> Focus Music
      safePlay(currentKeepGoingAudio);
      
      currentKeepGoingAudio.onended = () => {
        safePlay(audioBegin);
        audioBegin.onended = () => {
          safePlay(audioFocus);
        };
      };

    } else if (sessionCount === 4) {
      // Round 4: Chuỗi phát đặc biệt: Keepgoing -> Begin -> Chidori
      safePlay(audioKeepGoing);
      
      audioKeepGoing.onended = () => {
        safePlay(audioBegin);
        audioBegin.onended = () => {
          safePlay(audioChidori);
        };
      };
    }
  } else {
    // Thời gian BREAK: Phát Break_1, sau khi xong thì loop nhạc break nền
    safePlay(audioBreak1);
    
    audioBreak1.onended = () => {
      safePlay(audioBreak);
    };
  }

  updateSharinganVisuals();

  timerId = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(timerId);
      isRunning = false;
      switchMode();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerId);
  timerId = null;
  timeLeft = FOCUS_TIME;
  isRunning = false;
  currentMode = 'FOCUS';
  sessionCount = 1;

  stopAllAudio();
  if (chidoriVideo) chidoriVideo.pause();
  
  startBtn.textContent = "START";
  updateSharinganVisuals();
  updateDisplay();
}

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

updateDisplay();
updateSharinganVisuals();