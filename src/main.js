import './style.css'

// Import Sharingan Images
import tomoe1 from './assets/sharingan_1.png'
import tomoe2 from './assets/sharingane_2.png'
import tomoe3 from './assets/sharingan_3.png'
import mangekyou from './assets/itachi_sharingan.png'

// --- CẬP NHẬT SOUND ASSETS ---
import sharinganBeginSfx from './assets/sharingan_begin.mp3'
import focusSfx from './assets/focus_music.mp3'
import sharinganEndSfx from './assets/sharingan_end.mp3'
import breakSfx from './assets/break_music.mp3'
import session4KeepGoingSfx from './assets/Session_4_Keepgoing.mp3'
import chidoriSfx from './assets/chidorisound.mp3'

// Cấu hình hằng số
const FOCUS_TIME = 20 * 60;
const BREAK_TIME = 5 * 60;

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

const allAudios = [audioFocus, audioBreak, audioChidori, audioBegin, audioEnd, audioKeepGoing];

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

function stopAllAudio() {
  allAudios.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}

function switchMode() {
  stopAllAudio(); 

  if (currentMode === 'FOCUS') {
    if (sessionCount >= 4) {
      alert("Nhiệm vụ hoàn tất! Mangekyou cần nghỉ ngơi.");
      resetTimer();
      return;
    }
    currentMode = 'BREAK';
    timeLeft = BREAK_TIME;
    
    // Phát âm thanh kết thúc
    audioEnd.load();
    audioEnd.play().catch(e => console.log("Audio play prevented"));
  } else {
    currentMode = 'FOCUS';
    timeLeft = FOCUS_TIME;
    sessionCount++;
  }
  
  updateSharinganVisuals();
  updateDisplay();
  
  // Delay 1s để trình duyệt sẵn sàng cho mode tiếp theo
  setTimeout(() => {
    startTimer();
  }, 1000); 
}

function startTimer() {
  if (isRunning) return;
  
  isRunning = true;
  startBtn.textContent = currentMode === 'FOCUS' ? "KEEP GOING" : "RECOVERING";

  if (currentMode === 'FOCUS') {
    chidoriVideo.play().catch(() => {});
    
    if (sessionCount < 4) {
      audioBegin.load();
      audioBegin.play().catch(() => {});
      audioBegin.onended = () => {
        audioFocus.load();
        audioFocus.play().catch(() => {});
      };
    } else if (sessionCount === 4) {
      audioKeepGoing.load();
      audioKeepGoing.play().catch(() => {});
      audioKeepGoing.onended = () => {
        audioBegin.load();
        audioBegin.play().catch(() => {});
        audioChidori.load();
        audioChidori.play().catch(() => {});
      };
    }
  } else {
    // Luôn load lại audioBreak trước khi phát để tránh lỗi "im lặng" sau 20p
    audioBreak.load();
    audioBreak.play().catch(e => console.log("Break audio error:", e));
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
  chidoriVideo.pause();
  
  startBtn.textContent = "START";
  updateSharinganVisuals();
  updateDisplay();
}

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

updateDisplay();
updateSharinganVisuals();