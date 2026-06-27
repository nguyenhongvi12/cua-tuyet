// https://script.google.com/macros/s/AKfycbwxrLUVMdpbJOEeOPVQcz455beGWF_lZtNA90Vm0lTlGAN1KSoRQEJh42Kw5KwKR_Rh6Q/exec
/* ===================================================
   main.js — Landing Page Cua Tuyết
   Interactions: Scroll animations, navbar, FAQ, 
   counter, sticky bar, form handling
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. SCROLL ANIMATIONS (Intersection Observer) =====
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));


  // ===== 2. NAVBAR — Transparent → Solid on scroll =====
  const navbar = document.getElementById('navbar');
  const hero = document.getElementById('hero');

  const handleNavbarScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });


  // ===== 3. MOBILE MENU TOGGLE =====
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      navToggle.classList.toggle('active');
    });

    // Close menu on link click
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }


  // ===== 4. FAQ ACCORDION =====
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other FAQ items
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherAnswer = other.querySelector('.faq__answer');
          otherAnswer.style.maxHeight = null;
          other.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
        question.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });


  // ===== 5. COUNTER ANIMATION (Trust Stats) =====
  const statNumbers = document.querySelectorAll('.trust__stat-number[data-target]');
  let countersAnimated = false;

  const animateCounters = () => {
    if (countersAnimated) return;

    statNumbers.forEach(num => {
      const target = parseInt(num.getAttribute('data-target'), 10);
      const duration = 1500; // ms
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        num.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    });

    countersAnimated = true;
  };

  // Trigger counter when trust section is visible
  const trustSection = document.getElementById('trust');
  if (trustSection) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counterObserver.observe(trustSection);
  }


  // ===== 6. STICKY BOTTOM BAR (Mobile) =====
  const stickyBar = document.getElementById('stickyBar');

  if (stickyBar) {
    const handleStickyBar = () => {
      const heroHeight = hero ? hero.offsetHeight : 600;
      const scrollThreshold = heroHeight * 0.5;

      if (window.scrollY > scrollThreshold) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', handleStickyBar, { passive: true });
  }


  // ===== 7. PARALLAX HERO BACKGROUND =====
  const heroBg = document.querySelector('.hero__bg');

  if (heroBg) {
    const handleParallax = () => {
      const scrollY = window.scrollY;
      const heroHeight = hero ? hero.offsetHeight : 800;

      if (scrollY < heroHeight) {
        const translateY = scrollY * 0.3;
        heroBg.style.transform = `translateY(${translateY}px)`;
      }
    };

    window.addEventListener('scroll', handleParallax, { passive: true });
  }


  // ===== 8. SMOOTH SCROLL for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 60;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });


  // ===== 9. FORM HANDLING & GOOGLE SHEET SYNC =====
  // Nhập URL Web App của Google Apps Script sau khi triển khai sync_lead.js tại đây
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxrLUVMdpbJOEeOPVQcz455beGWF_lZtNA90Vm0lTlGAN1KSoRQEJh42Kw5KwKR_Rh6Q/exec";

  const leadForm = document.getElementById('leadForm');
  const formSubmitBtn = document.getElementById('form-submit');

  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(leadForm);
      const data = Object.fromEntries(formData.entries());

      // Vô hiệu hóa nút bấm và hiển thị trạng thái đang gửi
      if (formSubmitBtn) {
        formSubmitBtn.disabled = true;
        formSubmitBtn.textContent = 'Đang gửi thông tin...';
      }

      // Ánh xạ dữ liệu form thành payload tương thích với sync_lead.js
      const purposeMap = {
        'family': 'Bữa ăn gia đình',
        'gift': 'Quà biếu',
        'restaurant': 'Nhà hàng / Số lượng lớn',
        'other': 'Khác'
      };

      // Sinh mã đơn hàng ngẫu nhiên (AI + 10 số)
      let orderCode = "AI";
      for (let i = 0; i < 10; i++) {
        orderCode += Math.floor(Math.random() * 10);
      }

      const payload = {
        ho_ten: data.name || '',
        so_dien_thoai: data.phone || '',
        email: data.email || '',
        nhu_cau: purposeMap[data.purpose] || data.purpose || '',
        khu_vuc: data.area || '',
        ghi_chu: data.note || '',
        ma_don_hang: orderCode
      };

      try {
        if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.trim() !== "") {
          // Gửi dữ liệu đồng bộ qua Google Apps Script Web App
          // Dùng mode: 'no-cors' vì Google Apps Script redirect và không trả về header CORS mặc định, 
          // nhưng dữ liệu vẫn được nhận và ghi vào Google Sheet thành công.
          await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(payload)
          });
          console.log('Lead synced successfully via Apps Script:', payload);
        } else {
          console.warn('GOOGLE_SCRIPT_URL chưa được cấu hình. Dữ liệu form:', payload);
        }
      } catch (err) {
        console.error('Lỗi khi gửi dữ liệu:', err);
      } finally {
        // Hiển thị Modal QR thay vì thông báo tại chỗ
        const qrModal = document.getElementById('qrModal');
        const qrOrderCode = document.getElementById('qrOrderCode');
        const qrImage = document.getElementById('qrImage');
        const qrStatusWrapper = document.getElementById('qrStatusWrapper');
        const qrActionsWrapper = document.getElementById('qrActionsWrapper');
        const qrSuccessWrapper = document.getElementById('qrSuccessWrapper');
        const qrClose = document.getElementById('qrClose');

        if (qrModal) {
          // Reset giao diện Modal phòng khi mở lại
          if (qrStatusWrapper) qrStatusWrapper.style.display = 'flex';
          if (qrActionsWrapper) qrActionsWrapper.style.display = 'none';
          if (qrSuccessWrapper) qrSuccessWrapper.style.display = 'none';
          if (qrImage) qrImage.parentElement.style.display = 'inline-block';

          // Gán thông tin
          qrOrderCode.textContent = orderCode;
          
          // Tạo URL mã QR động
          const qrUrl = `https://vietqr.app/img?bank=Vietinbank&acc=108005176196&amount=99000&des=SEVQR+chuyen+khoan+${orderCode}&template=compact`;
          qrImage.src = qrUrl;

          // Hiển thị Modal
          qrModal.classList.add('active');

          // Cài đặt polling kiểm tra thanh toán mỗi 4 giây
          let isPaid = false;
          let pollInterval = setInterval(async () => {
            try {
              if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.trim() !== "") {
                const checkUrl = `${GOOGLE_SCRIPT_URL}?ma_don_hang=${orderCode}`;
                const res = await fetch(checkUrl);
                const result = await res.json();
                
                if (result.status === "success" && result.payment_status === "PAID") {
                  isPaid = true;
                  clearInterval(pollInterval);
                  // Chuyển UI sang trạng thái thành công
                  if (qrStatusWrapper) qrStatusWrapper.style.display = 'none';
                  if (qrActionsWrapper) qrActionsWrapper.style.display = 'none';
                  if (qrImage) qrImage.parentElement.style.display = 'none'; // Ẩn mã QR
                  if (qrSuccessWrapper) qrSuccessWrapper.style.display = 'block';
                }
              }
            } catch (err) {
              console.log("Polling error (có thể do mạng hoặc Apps Script redirect):", err);
            }
          }, 4000);

          // Sự kiện đóng Modal
          if (qrClose) {
            // Xóa sự kiện cũ (nếu có) để không bị lặp interval
            const newQrClose = qrClose.cloneNode(true);
            qrClose.parentNode.replaceChild(newQrClose, qrClose);
            newQrClose.addEventListener('click', () => {
              qrModal.classList.remove('active');
              clearInterval(pollInterval);
            });
          }
        }
      }
    });
  }

});
