const tabs = document.querySelector('.tabs');
const tabButtons = document.querySelectorAll('.tab');
const signupFields = document.querySelector('.signup-fields');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const submitLabel = document.getElementById('submitLabel');
const switchCopy = document.getElementById('switchCopy');
const signupNote = document.querySelector('.signup-note');
const form = document.getElementById('authForm');
const toast = document.querySelector('.toast');
let mode = 'login';

function setMode(nextMode) {
  mode = nextMode;
  const signup = mode === 'signup';
  tabs.classList.toggle('signup', signup);
  tabButtons.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active);
  });
  signupFields.classList.toggle('visible', signup);
  signupFields.setAttribute('aria-hidden', !signup);
  signupNote.classList.toggle('visible', signup);
  formTitle.textContent = signup ? 'ساخت حساب کاربری' : 'ورود به حساب کاربری';
  formSubtitle.textContent = signup ? 'چند قدم تا شروع یک تجربه‌ی جذاب فاصله دارید.' : 'برای ادامه، اطلاعات حساب خود را وارد کنید.';
  submitLabel.textContent = signup ? 'ساخت حساب کاربری' : 'ورود به حساب';
  switchCopy.innerHTML = signup
    ? 'قبلاً حساب ساخته‌اید؟ <button type="button" data-switch>وارد شوید</button>'
    : 'حساب کاربری ندارید؟ <button type="button" data-switch>ثبت‌نام کنید</button>';
}

tabButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
document.addEventListener('click', (event) => {
  if (event.target.matches('[data-switch]')) setMode(mode === 'login' ? 'signup' : 'login');
});

document.querySelector('.password-toggle').addEventListener('click', function () {
  const password = document.getElementById('password');
  const visible = password.type === 'text';
  password.type = visible ? 'password' : 'text';
  this.setAttribute('aria-label', visible ? 'نمایش رمز عبور' : 'پنهان کردن رمز عبور');
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 3300);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const identity = document.getElementById('identity');
  const password = document.getElementById('password');
  if (!identity.value.trim() || !password.value.trim()) {
    showToast('لطفاً شماره موبایل یا ایمیل و رمز عبور را وارد کنید.');
    (!identity.value.trim() ? identity : password).focus();
    return;
  }
  if (password.value.length < 6) {
    showToast('رمز عبور باید حداقل ۶ کاراکتر باشد.');
    password.focus();
    return;
  }
  showToast(mode === 'signup' ? 'حساب شما با موفقیت ساخته شد ✦' : 'خوش آمدید! در حال ورود به حساب شما...');
});

document.getElementById('forgotPassword').addEventListener('click', (event) => {
  event.preventDefault();
  showToast('لینک بازیابی رمز عبور برای شما ارسال می‌شود.');
});
