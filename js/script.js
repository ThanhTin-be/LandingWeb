// ===== YOUTUBE API SETUP =====
let youtubePlayer;
let isYoutubeMuted = true;
let isYouTubeAPIReady = false;
let youtubeAPILoadAttempts = 0;
const MAX_API_LOAD_ATTEMPTS = 3;

// Load YouTube API
function loadYouTubeAPI() {
    youtubeAPILoadAttempts++;
    
    // Kiểm tra nếu API đã được load
    if (window.YT && window.YT.Player) {
        console.log('✅ YouTube API đã có sẵn');
        onYouTubeIframeAPIReady();
        return;
    }
    
    // Kiểm tra số lần thử
    if (youtubeAPILoadAttempts > MAX_API_LOAD_ATTEMPTS) {
        console.error('❌ Đã thử tải YouTube API quá nhiều lần, sử dụng fallback');
        useFallbackBackground();
        return;
    }
    
    console.log(`🔄 Đang tải YouTube API (lần thử ${youtubeAPILoadAttempts})`);
    
    // Xóa script cũ nếu có
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
        existingScript.remove();
    }
    
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.defer = true;
    
    // Xử lý lỗi khi load script
    tag.onerror = function() {
        console.error('❌ Không thể tải YouTube API script');
        if (youtubeAPILoadAttempts < MAX_API_LOAD_ATTEMPTS) {
            setTimeout(() => loadYouTubeAPI(), 2000);
        } else {
            useFallbackBackground();
        }
    };
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // Fallback nếu API không load được sau 8 giây
    setTimeout(() => {
        if (!isYouTubeAPIReady) {
            console.warn('⚠️ YouTube API timeout, thử lại...');
            if (youtubeAPILoadAttempts < MAX_API_LOAD_ATTEMPTS) {
                loadYouTubeAPI();
            } else {
                useFallbackBackground();
            }
        }
    }, 8000);
}

// Fallback background khi YouTube không load được
function useFallbackBackground() {
    console.log('🎨 Sử dụng fallback background');
    const videoSlide = document.querySelector('.video-slide');
    const soundToggle = document.getElementById('soundToggle');
    
    if (videoSlide) {
        videoSlide.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
        videoSlide.classList.add('fallback-background');
    }
    
    if (soundToggle) {
        soundToggle.style.display = 'none';
    }
}

// YouTube API ready callback
window.onYouTubeIframeAPIReady = function() {
    isYouTubeAPIReady = true;
    console.log('✅ YouTube API đã sẵn sàng');
    
    try {
        initializeYouTubePlayer();
    } catch (error) {
        console.error('❌ Lỗi khi khởi tạo YouTube player:', error);
        useFallbackBackground();
    }
};

// Khởi tạo YouTube Player
function initializeYouTubePlayer() {
    const playerElement = document.getElementById('youtube-player');
    if (!playerElement) {
        console.error('❌ Không tìm thấy element youtube-player');
        useFallbackBackground();
        return;
    }
    
    console.log('🎬 Đang khởi tạo YouTube player...');
    
    try {
        youtubePlayer = new YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: 'NSnkb1IAjbE',
            host: 'https://www.youtube-nocookie.com', // Sử dụng nocookie domain
            playerVars: {
                autoplay: 1,        // Tự động phát
                mute: 1,           // Tắt âm mặc định
                loop: 1,           // Phát lặp
                playlist: 'NSnkb1IAjbE', // Cần thiết cho loop
                controls: 0,       // Ẩn điều khiển
                showinfo: 0,       // Ẩn thông tin video
                modestbranding: 1, // Ẩn logo YouTube
                iv_load_policy: 3, // Ẩn annotations
                cc_load_policy: 0, // Ẩn phụ đề
                playsinline: 1,    // Phát inline trên mobile
                disablekb: 1,      // Tắt keyboard controls
                fs: 0,             // Tắt fullscreen
                rel: 0,            // Không hiện video liên quan
                enablejsapi: 1,    // Bật JavaScript API
                origin: window.location.origin,
                wmode: 'opaque',   // Đảm bảo video hiển thị đúng
                start: 0,          // Bắt đầu từ giây 0
                end: 0,            // Không giới hạn thời gian kết thúc
                quality: 'hd1080'  // Chất lượng cao
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: onPlayerError
            }
        });
    } catch (error) {
        console.error('❌ Lỗi khi tạo YouTube player:', error);
        useFallbackBackground();
    }
}

// Xử lý khi player sẵn sàng
function onPlayerReady(event) {
    console.log('🎬 YouTube player đã sẵn sàng');
    
    try {
        // Set chất lượng video cao nhất
        const availableQualities = event.target.getAvailableQualityLevels();
        console.log('📺 Chất lượng có sẵn:', availableQualities);
        
        if (availableQualities.includes('hd1080')) {
            event.target.setPlaybackQuality('hd1080');
        } else if (availableQualities.includes('hd720')) {
            event.target.setPlaybackQuality('hd720');
        } else if (availableQualities.includes('large')) {
            event.target.setPlaybackQuality('large');
        }
        
        // Bắt đầu phát video
        event.target.playVideo();
        console.log('▶️ Bắt đầu phát video');
        
        // Đảm bảo video được mute
        event.target.mute();
        isYoutubeMuted = true;
        
    } catch (error) {
        console.error('❌ Lỗi khi cấu hình player:', error);
        useFallbackBackground();
    }
}

// Xử lý thay đổi trạng thái player
function onPlayerStateChange(event) {
    const states = {
        '-1': 'UNSTARTED',
        '0': 'ENDED',
        '1': 'PLAYING',
        '2': 'PAUSED',
        '3': 'BUFFERING',
        '5': 'CUED'
    };
    
    console.log('🔄 Trạng thái video:', states[event.data] || event.data);
    
    try {
        // Đảm bảo video luôn phát lặp
        if (event.data === YT.PlayerState.ENDED) {
            setTimeout(() => {
                if (youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
                    youtubePlayer.playVideo();
                    console.log('🔄 Video kết thúc, phát lại');
                }
            }, 100);
        }
        
        // Đảm bảo video được mute khi bắt đầu phát
        if (event.data === YT.PlayerState.PLAYING && isYoutubeMuted) {
            event.target.mute();
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi xử lý thay đổi trạng thái:', error);
    }
}

// Xử lý lỗi player
function onPlayerError(event) {
    console.error('❌ Lỗi YouTube player:', event.data);
    
    const errorMessages = {
        2: 'Video ID không hợp lệ hoặc tham số không đúng',
        5: 'Video không thể phát trên HTML5 player',
        100: 'Video không tìm thấy hoặc bị xóa',
        101: 'Video không cho phép nhúng',
        150: 'Video không cho phép nhúng (giống 101)'
    };
    
    const errorMessage = errorMessages[event.data] || `Lỗi không xác định (${event.data})`;
    console.error('Chi tiết lỗi:', errorMessage);
    
    // Thử video khác hoặc sử dụng fallback
    if (event.data === 100 || event.data === 101 || event.data === 150) {
        console.log('🔄 Thử sử dụng video ID khác...');
        // Có thể thử video ID khác ở đây
        setTimeout(() => {
            useFallbackBackground();
        }, 1000);
    } else {
        useFallbackBackground();
    }
}

// Khởi tạo thư viện AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function () {
    // Load YouTube API
    loadYouTubeAPI();
    
    AOS.init({
        duration: 1000, // thời gian chạy hiệu ứng (từ 0 đến 3000ms, bước nhảy 50ms)
        easing: 'ease-in-out', // kiểu chuyển động mặc định cho các hiệu ứng AOS
        once: true, // hiệu ứng chỉ chạy 1 lần khi cuộn xuống (không lặp lại khi cuộn lại lên)
        mirror: false, // không chạy hiệu ứng khi cuộn ngược lên (tắt hiệu ứng ngược)
        anchorPlacement: 'top-bottom', // xác định vị trí của phần tử sẽ kích hoạt hiệu ứng
    });

    // ===== KHỞI TẠO SWIPER CHO HERO SLIDESHOW =====
    const heroSwiper = new Swiper('.hero-swiper', {
        // Cấu hình cơ bản
        loop: true, // Lặp vô hạn các slide
        autoplay: false, // Tắt autoplay ban đầu (sẽ bật khi cần)
        effect: 'fade', // Hiệu ứng chuyển slide fade
        fadeEffect: {
            crossFade: true // Hiệu ứng fade mượt mà
        },
        speed: 1000, // Tốc độ chuyển slide (1 giây)

        // Pagination (chấm tròn điều hướng)
        pagination: {
            el: '.swiper-pagination',
            clickable: true, // Cho phép click vào chấm để chuyển slide
            dynamicBullets: false, // Không sử dụng dynamic bullets
        },

        // Hỗ trợ chuột và touch
        grabCursor: true, // Hiển thị con trỏ grab khi hover
        touchRatio: 1, // Độ nhạy của touch
        touchAngle: 45, // Góc touch để kích hoạt swipe

        // Keyboard navigation
        keyboard: {
            enabled: true, // Cho phép điều khiển bằng bàn phím
            onlyInViewport: true, // Chỉ hoạt động khi slider trong viewport
        },

        // Responsive breakpoints
        breakpoints: {
            320: {
                touchRatio: 1.5, // Tăng độ nhạy touch trên mobile
            },
            768: {
                touchRatio: 1,
            }
        },

        // Events
        on: {
            slideChange: function () {
                const activeSlide = this.slides[this.activeIndex];
                const soundToggle = document.getElementById('soundToggle');

                // Kiểm tra loại slide hiện tại
                if (activeSlide && activeSlide.classList.contains('video-slide')) {
                    // ===== SLIDE VIDEO =====
                    soundToggle.style.display = 'flex';

                    // ❌ DỪNG AUTOPLAY khi ở slide video
                    if (this.autoplay.running) {
                        this.autoplay.stop();
                        console.log('🎥 Đang ở slide video - Dừng autoplay');
                    }

                    // Đảm bảo YouTube video đang phát
                    if (youtubePlayer && typeof youtubePlayer.getPlayerState === 'function') {
                        try {
                            const state = youtubePlayer.getPlayerState();
                            if (state !== YT.PlayerState.PLAYING) {
                                youtubePlayer.playVideo();
                            }
                        } catch (error) {
                            console.error('❌ Lỗi khi kiểm tra trạng thái video:', error);
                        }
                    }
                } else {
                    // ===== SLIDE HÌNH ẢNH =====
                    soundToggle.style.display = 'none';

                    // Tạm dừng YouTube video khi không ở slide video
                    if (youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') {
                        try {
                            youtubePlayer.pauseVideo();
                        } catch (error) {
                            console.error('❌ Lỗi khi tạm dừng video:', error);
                        }
                    }

                    // ✅ BẬT AUTOPLAY khi ở slide hình ảnh
                    if (!this.autoplay.running) {
                        // Cấu hình autoplay cho slide hình ảnh
                        this.autoplay.delay = 5000; // 5 giây cho mỗi slide ảnh
                        this.autoplay.start();
                        console.log('🖼️ Đang ở slide hình ảnh - Bật autoplay');
                    }
                }

                // Làm mới hiệu ứng AOS cho slide mới
                AOS.refresh();
            },

            // Xử lý khi slider được khởi tạo
            init: function () {
                const firstSlide = this.slides[this.activeIndex];
                const soundToggle = document.getElementById('soundToggle');

                // Kiểm tra slide đầu tiên
                if (firstSlide && firstSlide.classList.contains('video-slide')) {
                    soundToggle.style.display = 'flex';
                    console.log('🎬 Khởi tạo với slide video - Autoplay tắt');
                } else {
                    soundToggle.style.display = 'none';
                    // Nếu slide đầu không phải video, bật autoplay
                    this.autoplay.delay = 5000;
                    this.autoplay.start();
                    console.log('🖼️ Khởi tạo với slide hình ảnh - Autoplay bật');
                }
            }
        }
    });

    // ===== XỬ LÝ HEADER TRONG SUỐT =====
    const header = document.getElementById('mainHeader');
    const heroSection = document.getElementById('hero');

    // Tạo Intersection Observer để theo dõi Hero Section
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Khi Hero Section hiển thị - header trong suốt
                header.classList.remove('scrolled');
            } else {
                // Khi cuộn qua Hero Section - header có nền trắng
                header.classList.add('scrolled');
            }
        });
    }, {
        threshold: 0.1, // Kích hoạt khi 10% Hero Section còn hiển thị
        rootMargin: '-50px 0px 0px 0px' // Offset để header chuyển đổi sớm hơn một chút
    });

    // Bắt đầu theo dõi Hero Section
    heroObserver.observe(heroSection);

    // ===== CUỘN MƯỢT CHO NAVIGATION =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href'); // lấy id mục tiêu từ thẻ a
            const targetElement = document.querySelector(targetId); // chọn phần tử có id tương ứng

            if (targetElement) {
                // Tính toán vị trí cuộn (có bù trừ chiều cao của header)
                const headerOffset = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset - 20; // trừ thêm 20px để tạo khoảng cách

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth' // cuộn mượt
                });

                // Đóng menu mobile nếu đang mở
                const mainNav = document.querySelector('.main-nav');
                const menuToggle = document.querySelector('.menu-toggle');
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            }
        });
    });

    // ===== XỬ LÝ MENU MOBILE =====
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Tự động đóng menu mobile khi click ra ngoài
    document.addEventListener('click', (event) => {
        if (!mainNav.contains(event.target) && !menuToggle.contains(event.target) && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });

    // ===== XỬ LÝ VIDEO VÀ ÂM THANH =====
    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = soundToggle.querySelector('i');

    // Xử lý nút bật/tắt âm thanh cho YouTube
    soundToggle.addEventListener('click', function () {
        if (!youtubePlayer || !isYouTubeAPIReady || typeof youtubePlayer.isMuted !== 'function') {
            console.warn('⚠️ YouTube player chưa sẵn sàng');
            return;
        }
        
        try {
            const currentlyMuted = youtubePlayer.isMuted();
            
            if (currentlyMuted) {
                // Bật âm thanh YouTube
                youtubePlayer.unMute();
                youtubePlayer.setVolume(50);
                isYoutubeMuted = false;
                soundIcon.className = 'fas fa-volume-up';
                soundToggle.classList.add('unmuted');
                soundToggle.setAttribute('aria-label', 'Tắt âm thanh');
                console.log('🔊 Đã bật âm thanh YouTube');
            } else {
                // Tắt âm thanh YouTube
                youtubePlayer.mute();
                isYoutubeMuted = true;
                soundIcon.className = 'fas fa-volume-mute';
                soundToggle.classList.remove('unmuted');
                soundToggle.setAttribute('aria-label', 'Bật âm thanh');
                console.log('🔇 Đã tắt âm thanh YouTube');
            }
        } catch (error) {
            console.error('❌ Lỗi khi thay đổi âm thanh:', error);
        }
    });

    // Tạm dừng YouTube video khi không trong viewport để tiết kiệm băng thông
    const videoObserverOptions = {
        threshold: 0.5 // Video phải hiển thị ít nhất 50% để tiếp tục phát
    };

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!youtubePlayer || !isYouTubeAPIReady || typeof youtubePlayer.playVideo !== 'function') return;
            
            try {
                if (entry.isIntersecting) {
                    // YouTube video trong viewport - tiếp tục phát
                    const currentSlide = heroSwiper.slides[heroSwiper.activeIndex];
                    if (currentSlide && currentSlide.classList.contains('video-slide')) {
                        youtubePlayer.playVideo();
                        console.log('▶️ YouTube video tiếp tục phát (trong viewport)');
                    }
                } else {
                    // YouTube video ngoài viewport - tạm dừng
                    youtubePlayer.pauseVideo();
                    console.log('⏸️ YouTube video tạm dừng (ngoài viewport)');
                }
            } catch (error) {
                console.error('❌ Lỗi khi điều khiển video:', error);
            }
        });
    }, videoObserverOptions);

    // Bắt đầu theo dõi hero section
    videoObserver.observe(heroSection);

    // ===== ERROR HANDLING VÀ FALLBACK =====
    // Xử lý lỗi global để tránh crash
    window.addEventListener('error', function(event) {
        if (event.message && event.message.includes('YouTube')) {
            console.warn('⚠️ Lỗi liên quan đến YouTube:', event.message);
            event.preventDefault();
        }
    });
    
    // Xử lý unhandled promise rejection
    window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && event.reason.toString().includes('YouTube')) {
            console.warn('⚠️ Promise rejection liên quan đến YouTube:', event.reason);
            event.preventDefault();
        }
    });

    // ===== XỬ LÝ RESPONSIVE CHO SLIDESHOW =====
    // Điều chỉnh autoplay delay dựa trên kích thước màn hình
    function adjustSlideshowForDevice() {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // Trên mobile: tăng thời gian autoplay để người dùng có thể đọc nội dung
            heroSwiper.autoplay.delay = 7000;
        } else {
            // Trên desktop: thời gian autoplay bình thường
            heroSwiper.autoplay.delay = 5000;
        }
    }

    // Gọi hàm khi tải trang
    adjustSlideshowForDevice();

    // Gọi hàm khi thay đổi kích thước màn hình
    window.addEventListener('resize', adjustSlideshowForDevice);

    // ===== ACCESSIBILITY IMPROVEMENTS =====
    // Thêm keyboard navigation cho slideshow
    document.addEventListener('keydown', function (e) {
        // Chỉ hoạt động khi slideshow đang trong viewport
        const heroRect = heroSection.getBoundingClientRect();
        const isHeroVisible = heroRect.top < window.innerHeight && heroRect.bottom > 0;

        if (isHeroVisible) {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    heroSwiper.slidePrev();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    heroSwiper.slideNext();
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    const currentSlide = heroSwiper.slides[heroSwiper.activeIndex];
                    // Chỉ toggle autoplay nếu đang ở slide hình ảnh
                    if (currentSlide && !currentSlide.classList.contains('video-slide')) {
                        if (heroSwiper.autoplay.running) {
                            heroSwiper.autoplay.stop();
                        } else {
                            heroSwiper.autoplay.start();
                        }
                    }
                    break;
            }
        }
    });

    // ===== PERFORMANCE OPTIMIZATION =====
    // Lazy load images trong các slide không active
    const slideImages = document.querySelectorAll('.hero-slide img');
    slideImages.forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
        }
    });

    console.log('🎉 Hero Slideshow với Video và Hình ảnh đã được khởi tạo thành công!');
    console.log('📋 Quy tắc autoplay:');
    console.log('   🎥 Slide video: KHÔNG tự động chuyển');
    console.log('   🖼️ Slide hình ảnh: TỰ ĐỘNG chuyển sau 5-7 giây');

    // ===== COUNTER ANIMATION CHO STATISTICS =====
    function animateCounter(element, start, end, duration, suffix = '') {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Sử dụng easing function để tạo hiệu ứng mượt mà
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * (end - start) + start);
            
            element.textContent = current.toLocaleString('vi-VN') + suffix;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end.toLocaleString('vi-VN') + suffix;
            }
        };
        window.requestAnimationFrame(step);
    }

    // Khởi tạo Intersection Observer cho Statistics
    const statsSection = document.querySelector('.community-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Lấy tất cả các số cần animate
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    
                    statNumbers.forEach((statNumber, index) => {
                        const text = statNumber.textContent;
                        let targetNumber;
                        let suffix = '';
                        
                        // Xử lý các loại số khác nhau
                        if (text.includes('%')) {
                            targetNumber = parseInt(text.replace('%', ''));
                            suffix = '%';
                        } else if (text.includes('+')) {
                            targetNumber = parseInt(text.replace(/[+,]/g, ''));
                            suffix = '+';
                        } else {
                            targetNumber = parseInt(text.replace(/[,]/g, ''));
                        }
                        
                        // Delay khác nhau cho mỗi counter để tạo hiệu ứng cascade
                        setTimeout(() => {
                            animateCounter(statNumber, 0, targetNumber, 2000, suffix);
                            // Thêm class để kích hoạt hiệu ứng underline
                            statNumber.closest('.stat-item').classList.add('animated');
                        }, index * 200);
                    });
                    
                    // Chỉ chạy animation một lần
                    statsObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5, // Kích hoạt khi 50% section hiển thị
            rootMargin: '0px 0px -100px 0px' // Offset để animation kích hoạt sớm hơn
        });

        statsObserver.observe(statsSection);
    }
});