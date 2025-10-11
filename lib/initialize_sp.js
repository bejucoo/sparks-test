


/**
 * Panable load image and initialize
 * 
 */


jQuery(document).ready(function($){


    class Panable {

        constructor(object) {
            this.swiper = false;
            this.maxHeight = 0;
            this.maxWidth = 0;
            this.popups = [];
        }
        initScene() {

            if (window.panableConfig.debug){
                console.warn('Init Scene');
                this.createPopup('<b>Config :</b><br /> ' + JSON.stringify(window.panableConfig).replace(/,/g, '<br>'));
                this.createPopup('<br><b>Device :</b><br /> ' + JSON.stringify(navigator.userAgent) + '<br><br>');
            }

            let instance = this;
            window.globalID = false;
            window.reachEdge = false;
            window.isTouchpad = false;
            window.currentProgress = window.panableConfig.initX;

            if (window.panableConfig.direction == 'vertical') {
                $('#img1, #img2, #img3').each(function() {
                    $(this).height() > instance.maxHeight ? instance.maxHeight = $(this).height() : instance.maxHeight = instance.maxHeight; // TODO : check if still necessary (see setProgress instead of setTranslate)
                });
                $('.swiper-wrapper').css({ height: instance.maxHeight }); // Set max height for canvas (vertical) - necessary
            } else {
                $('#img1, #img2, #img3').each(function() {
                    $(this).width() > instance.maxWidth ? instance.maxWidth = $(this).width() : instance.maxWidth = instance.maxWidth;
                });
            }

            // Set body bg color
            if (window.panableConfig.bg) {
                $('.swiper-wrapper, .swiper-slide').css({ backgroundColor: window.panableConfig.bg });
                //$('.swiper-wrapper').css({ backgroundColor: window.panableConfig.bg });
            }
            let momentumRatio = .4;
            if(window.panableConfig.momentumRatio){
                momentumRatio = window.panableConfig.momentumRatio;
            }
            let momentumVelocityRatio = .4;
            if(window.panableConfig.momentumVelocityRatio){
                momentumVelocityRatio = window.panableConfig.momentumVelocityRatio;
            } 
            //alert('TEST1');
            let config = {
                //centeredSlides: true,
                //modules: [this.panableSwipperPlugin],
                slidesPerView: 'auto',
                loop: false,
                spaceBetween: 0,
                cssMode: window.isIOS && window.panableConfig.forceCssModeforIphone ? true : false, // Only for safari IOS
                autoHeight: window.isIOS && window.panableConfig.forceCssModeforIphone ? true : false, // Fix safari vertical scroll
                virtualTranslate: true, // makes the slider not move automatically, you'll have to do the translate animation
                /*keyboard: {
                    enabled: true,
                    onlyInViewport: false
                },*/
                freeMode: {
                    enabled: true,
                    minimumVelocity: window.panableConfig.hasOwnProperty('minimumVelocity') ? window.panableConfig.minimumVelocity : (window.isMobile ? .5 : .1),     // window.isMobile ? .5 : .1, // Minimum touchmove-velocity required to trigger free mode momentum (default : 0.02)
                    momentum: true,
                    //momentumBounce: window.isMobile ? false : true, // default : true
                    momentumBounce: false,
                    momentumRatio: window.isMobile ? (window.panableConfig.strictMobileScroll ? 0.01 : momentumRatio) : momentumRatio, // Higher value produces larger momentum distance after you release slider (default : 1)
                    momentumVelocityRatio: window.isMobile ? (window.panableConfig.strictMobileScroll ? 0.01 : momentumVelocityRatio) : momentumVelocityRatio, //Higher value produces larger momentum velocity after you release slider (default : 1)
                    sticky: false, //Set to enabled to enable snap to slides positions in free mode,  default false
                },
                grabCursor: true,
                mousewheel: {
                    releaseOnEdges: false,
                    enabled: window.panableConfig.direction == 'vertical' ? false : true, // Set to false to manage mousewheel manually (if true, this allow forceToAxis...). Allow to dissociate touchpad and scroll (scroll is manual, touchpad is native)
                    sensitivity: window.panableConfig.touchScrollSensitivity ? window.panableConfig.touchScrollSensitivity : .5,
                    forceToAxis:true,
                },
                observer: true,
                observeParents: true,
                direction: window.panableConfig.direction,
                roundLengths:true, // fix font 
                preloadImages: true, // fix initial load
                /*scrollbar: {
                    el: ".swiper-scrollbar",
                    hide: false,
                },*/
            };

            //this.createPopup('<span style="color:green">minimumVelocity : '+ (window.panableConfig.hasOwnProperty('minimumVelocity') ? window.panableConfig.minimumVelocity : (window.isMobile ? .5 : .1)) +'</span>');
            //this.createPopup('<span style="color:green">momentumRatio : '+ (window.isMobile ? (window.panableConfig.strictMobileScroll ? 0.01 : momentumRatio) : momentumRatio) +'</span>');
            //this.createPopup('<span style="color:green">momentumVelocityRatio : '+ (window.isMobile ? (window.panableConfig.strictMobileScroll ? 0.01 : momentumVelocityRatio) : momentumVelocityRatio) +'</span>');
            this.createPopup('<span style="color:green">js version : '+ new Date(document.lastModified).getTime().toString().slice(0,-3) +'</span>');
            this.createPopup('<span style="color:green">version : 5</span>');

            // Initialize swiper
            let momentumInterval = false;
        
            let panableElement = this.swiper = new Swiper(".panableElement", config);
        
            panableElement.on('init', (swiper) => {

                if (!window.panableConfig.debug) return;
                console.log('init');
                this.createPopup('<span style="color:green">init</span>');

            });
            panableElement.on('afterInit', (swiper) => {
                if (!window.panableConfig.debug) return;
                console.log('After init');
            });
            panableElement.on('imagesReady', (swiper) => {

                if (!window.panableConfig.debug) return;
                console.log('imagesReady');
                this.createPopup('<span style="color:green">imagesReady</span>');
            });
            panableElement.on('resize', (swiper) => {
                if (!window.panableConfig.debug) return;
                console.log('resize');
            });
            panableElement.on('progress', (swiper, e) => {

                if(e !== 0 && e !== 1) window.reachEdge = false;
                else window.reachEdge = true;

                if(e) window.currentProgress = e;
                if(e == 0){
                    if(typeof window.globalID != 'undefined'){
                        if (window.panableConfig.debug) console.warn('cancelAnimationFrame on progress 0');
                        window.globalID = undefined;
                        cancelAnimationFrame(window.globalID);
                    } 
                }

                //if (!window.panableConfig.debug) return;
                //console.log('progress', e);
            });

            panableElement.on('scroll', (swiper, e) => {
                // Event fired with touchpad, or on verticals pan
                // remove mouse scroll event for horizontal, if touchpad
                if(window.panableConfig.direction == 'horizontal'){
                    if (window.panableConfig.debug) console.log('scroll & horizontal, set isTouchpad to true to disable further animations');
                    window.isTouchpad = true;
                    this.createPopup('<span style="color:red">Touchpad detected</span>, scroll disabled');
                }
           
                if (!window.panableConfig.debug) return;
                console.log('scroll', e);
                this.createPopup('<span style="color:light-blue">scroll</span>',1);
            });
            panableElement.on('click', (swiper, e) => {
                if(typeof window.globalID != 'undefined'){
                    if (window.panableConfig.debug){
                        console.warn('cancelAnimationFrame on click');
                    }
                    cancelAnimationFrame(window.globalID);
                    window.globalID = undefined;
                
                }
                if (!window.panableConfig.debug) return;
                console.log('click');
                this.createPopup('<span style="color:light-blue">clic</span>',1);
            });
            panableElement.on('tap', (swiper, e) => {
                if(typeof window.globalID != 'undefined'){
                    if (window.panableConfig.debug) console.warn('cancelAnimationFrame on tap');
                    cancelAnimationFrame(window.globalID);
                    window.globalID = undefined;
                
                }
                if (!window.panableConfig.debug) return;
                console.log('tap');
                this.createPopup('<span style="color:light-blue">tap</span>',1);
            });
            panableElement.on('momentumBounce', (swiper) => {
                if (!window.panableConfig.debug) return;
                console.log('momentumBounce');
                this.createPopup('<span style="color:light-blue">momentumBounce</span>',1);
            });
        
            panableElement.on('touchMove', (swiper,e) => {

                if(typeof window.globalID != 'undefined'){
                    if (window.panableConfig.debug) console.warn('cancelAnimationFrame on touchmove');
                    cancelAnimationFrame(window.globalID);
                    //cancelAnimationFrame(momentumInterval);
                    window.globalID = undefined;
                
                }

                if (!window.panableConfig.debug) return;
                this.createPopup('<span style="color:light-blue">.</span>',1);
                console.log('touchMove',e);
            });
            panableElement.on('setTranslate', (swiper, e) => {
            
                let progress = swiper.progress;
                let parallaxImages = swiper.slides[0].children;
                let image1 = parallaxImages[0];
                let image2 = parallaxImages[1];
                let image3 = parallaxImages[2];

                if (window.panableConfig.direction == 'horizontal') {
                    image1.style.transform = "translate3d(" + -((image1.offsetWidth - window.innerWidth) * progress) + "px, 0, 0)";
                    image2.style.transform = "translate3d(" + -((image2.offsetWidth - window.innerWidth) * progress) + "px, 0, 0)";
                    image3.style.transform = "translate3d(" + -((image3.offsetWidth - window.innerWidth) * progress) + "px, 0, 0)";

                } else {
                    image1.style.transform = "translate3d(0, " + -((image1.offsetHeight - window.innerHeight) * progress) + "px, 0)";
                    image2.style.transform = "translate3d(0, " + -((image2.offsetHeight - window.innerHeight) * progress) + "px, 0)";
                    image3.style.transform = "translate3d(0, " + -((image3.offsetHeight - window.innerHeight) * progress) + "px, 0)";
                }

                if (!window.panableConfig.debug) return;
                console.log('setTranslate',e);
            });
     
            function easeOutValueInSteps(initialValue, targetValue, totalSteps, currentStep) {
                return initialValue + (targetValue - initialValue) * (1 - Math.pow(1 - currentStep / totalSteps, 2));
            }
       
            panableElement.on('setTransition', (swiper, e) => {
           
                if(window.isMobile && window.panableConfig.strictMobileScroll){
                    if(e > 0){

                        let step = 80;
                    
                        let touchDistanceLimit = 150;
                        if(window.panableConfig.direction == 'vertical' && window.isMobile){
                            touchDistanceLimit = 210; // a bit longer for vertical
                        }

                        if(!touchDistance || touchDistance > touchDistanceLimit || touchDistance < (touchDistanceLimit * -1)){
                            touchDistance = touchDistanceLimit;
                            //this.createPopup('CAP to 150px');
                        }

                        if (touchDistance) {
                          step = Math.abs(touchDistance) / 5;
                        }

                    
                        //var self = this;
                        //this.createPopup('Animates in ' + step + ' steps');

                        let originalStep = step;

                        //console.log('setTransition for StrictoMobileScroll', parseInt(e), touchDistance);
                        //this.createPopup('  test ' +  touchDistance);
                        //console.log(touchDistance);

                        cancelAnimationFrame(momentumInterval);

                        let interval = 0;

                        let self = this;
                        function updateFrame() {

                          let expo = easeOutValueInSteps(originalStep, 1, originalStep, interval);

                          //self.createPopup('expo : ' + expo );
                      
                          let delta = -expo;
                          let currentTranslate = swiper.getTranslate();
                          if (swiper.swipeDirection == 'prev') {
                            delta = expo;
                          }
                          let translate = currentTranslate + delta;
                          if (!swiper.isEnd && !swiper.isBeginning){
                            self.createPopup('<span style="color:light-blue;">•</span>',1);
                            swiper.setTranslate(translate);
                          }else{
                            self.createPopup('<span style="color:red;">•</span>',1);
                          }

                          interval++;
                          if (expo <= 2) return;
                          momentumInterval = requestAnimationFrame(updateFrame);

                      
                        }

                        momentumInterval = requestAnimationFrame(updateFrame);
                        this.createPopup('Active élan mobile : ' + touchDistance + 'px, step : ' + step + '  ');


                    }
                }else{

                    //console.log('setTransition NORMAL', e);
                

                    let transition = parseInt(e);
                    let parallaxImages = swiper.slides[0].children;
                    let image1 = parallaxImages[0];
                    let image2 = parallaxImages[1];
                    let image3 = parallaxImages[2];
                    image1.style.transitionDuration = transition + "ms";
                    image2.style.transitionDuration = transition + "ms";
                    image3.style.transitionDuration = transition + "ms";

                    if(transition) this.createPopup('Active élan desktop : ' + transition,1);

                }

                if (!window.panableConfig.debug) return;
                console.log('setTransition', e);
                //instance.createPopup('<span style="color:light-green">Transition desktop</span>');
            });
            panableElement.on('reachBeginning', () => {
                window.reachEdge = true;
                if (!window.panableConfig.debug) return;
                console.log('reachBeginning');
            });
            panableElement.on('reachEnd', (swiper) => {
                window.reachEdge = true;
                if (!window.panableConfig.debug) return;
                console.log('reachEnd');
            });

            // Init test touch events
            let initTouch = false;
            let touchDistance = -100;
            if(window.isMobile){
                $(document).bind('touchstart', function(e) {
                    // register pointer position
                    let touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    let pos = touch.pageX;
                    if(window.panableConfig.direction == 'vertical') pos = touch.pageY;
                    //console.log('start pos : ',pos);
                    initTouch = pos;

                    //cancelAnimationFrame(window.globalID);
                    cancelAnimationFrame(momentumInterval);
                });
                $(document).bind('touchend',function(e){
                    let touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    let pos = touch.pageX;
                    if(window.panableConfig.direction == 'vertical') pos = touch.pageY;
                    //console.log('end dist : ',initTouch - pos);
                    touchDistance = initTouch - pos; // Store last swipe distance
                    //onsole.log('touchDistance : ',touchDistance, initTouch, pos);
                });
            }
        

            // Init Scroll events
            let setTranslateTimeout = false;
        
            let goal = false;
      
            $(window).bind('wheel', function(event) {

                if (window.panableConfig.debug) console.log('mousewheel DOMMouseScroll');

                if ($('.info-article').hasClass('toClose')){
                    if (window.panableConfig.debug) console.log('Popup is opened, do not scroll in pan');
                    event.preventDefault();
                    return false;
                }else{
                    if (window.panableConfig.debug) console.log('Popup is closed, normal scroll in pan');
                }

                if (window.panableConfig.direction == 'vertical'){
                    if (window.panableConfig.debug) console.log('vertical pan, disable default scroll event (leave custom animation)');
                    event.preventDefault();
                    // problem : with touchpad (animation... and not strict scroll). maybe set small distance if is touchpad ?
                }

                if(isTouchpad){
                    if (window.panableConfig.debug) console.log('touchpad is active, disable scroll & custom animation');
                    event.preventDefault();
                    return false;
                
                }
                if (window.panableConfig.debug) console.log('smooth scroll is active (no touchpad detected)');
            
                let distance = window.panableConfig.scrollDistance;
                if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                    goal = panableElement.translate + distance;
                    //panableElement.translateTo(panableElement.translate + distance, speed, true, true) // working but bug synced images
                } else {
                    goal = panableElement.translate - distance;
                }

                let now = new Date().getTime();
                // if last setTranslate was called less than 100ms ago, it might be a touchpoad, ignore...
                if (now - setTranslateTimeout < 80){
                    if (window.panableConfig.debug) console.log('Do not add animation (TOOFAST)');
                }else{
                    cancelAnimationFrame(window.globalID); // prevent acceleration (additionnal scrolling)
                    window.globalID = requestAnimationFrame(animateElement);
                    instance.createPopup('Active élan scroll :  ');
                }

                // set new timeout
                setTranslateTimeout = now;
            
            });

            // Bind keyboard events
            document.onkeydown = checkKey;
            function checkKey(e) {
                let distance = window.panableConfig.scrollDistance;
                let transitionTime = window.panableConfig.keyboardTransitionTime ?? 5000;
                let percentMoveStep = window.panableConfig.hasOwnProperty('percentMoveStep') ? (1/(window.panableConfig.percentMoveStep - 1)) : .1;
                e = e || window.event;
                if (e.keyCode == '37') {
                    let translate = panableElement.translate + (distance/10);
                    panableElement.translateTo(translate, 0, true, true);
                }
                else if (e.keyCode == '39') {
                    let translate = panableElement.translate - (distance/10);
                    panableElement.translateTo(translate, 0, true, true);
                }

                if (e.keyCode == '81') { // Q
                    //panableElement.setProgress(0, transitionTime, true, true);
                    panableElement.setProgress(panableElement.progress - percentMoveStep, 100, true, true);
                }
                else if (e.keyCode == '68') { // D
                    //panableElement.setProgress(1, transitionTime, true, true);
                    panableElement.setProgress(panableElement.progress + percentMoveStep, 100, true, true);
                }

                // if key is W or C
                if (e.keyCode == '87') {
                    panableElement.setProgress(0, transitionTime, true, true);
                }
                else if (e.keyCode == '67') {
                    panableElement.setProgress(1, transitionTime, true, true);
                }


                if(window.panableConfig.debug) instance.createPopup('<span style="color:red">Keyboard detected</span> ' + e.keyCode);


            }
 
            function animateElement(){
            
                let currentDistance = goal - panableElement.translate;
                if(goal != false){
                    if(
                        (panableElement.translate > goal - 30 && panableElement.translate < goal + 30) ||   // if we are close to the goal
                        window.reachEdge                                                                    // if we are at the edge
                    ){
                        //cancelAnimationFrame(window.globalID);
                        if (window.panableConfig.debug) console.warn('kill animateElement (Goal reached) or on edge');
                        window.reachEdge = false;
                    }else{
                        let translate = parseInt(panableElement.translate + currentDistance / window.panableConfig.scrollSpeed);
                        //if(goal > panableElement.translate) 
                        //console.log(translate);
                        panableElement.translateTo(translate, 0, true, true); // 0 = instantaneous

                        if(panableElement.getTranslate() != panableElement.previousTranslate){
                            window.globalID = requestAnimationFrame(animateElement);
                        
                            instance.createPopup('<span style="color:yellow">.</span> ',1);
                        }else{
                            if (window.panableConfig.debug) console.warn('Stop here, not enough pixel to split');
                        }
                        
                    }
                }
            }

            $(window).resize(function() {

                if (window.panableConfig.direction == 'horizontal'){
                    instance.checkCinemaMode();
                    instance.showCinemaPopup();
                }

                //$('#overlay').css({'opacity':1, 'z-index':100});
                //$('#overlay .content_overlay').hide();
                //panableElement.setProgress(window.currentProgress);
                setTimeout(() => {
                    panableElement.setProgress(window.currentProgress);
                    if(window.panableConfig.debug) instance.createPopup('<span style="color:red">Resize detected!</span>');
                    //$('#overlay').css({'opacity':0, 'z-index':-1});
                    //$('#overlay .content_overlay').show();
                },50); // initially with 500
            
            });

            // Init cinema check
            if (window.panableConfig.direction == 'horizontal'){
                this.checkCinemaMode();
            }

            // Set initial position
            if (window.panableConfig.initX != 0) {
                setTimeout(() => { 
                    panableElement.setProgress(window.panableConfig.initX); 

                    if (window.panableConfig.debug) console.warn('initX setup',window.panableConfig.initX);

                    // patch for initX when cache is active (@todo)
                    if(panableElement.isBeginning){
                        setTimeout(() => { 
                            //$(window).trigger('resize');
                            //panableElement = this.swiper = new Swiper(".panableElement", config);
                            panableElement.setProgress(window.panableConfig.initX); 
                            if (window.panableConfig.debug) console.warn('force initX setup',window.panableConfig.initX);
                        }, 500);
                    }

                }, 500);
            }


        }
        showCinemaPopup() {

            var wW = $(window).width();
            var wH = $(window).height();
            if (wH > wW) {
                if (localStorage.getItem("cinema-alert") === null) {
                    $('.rotate-container').hide().css('z-index', 9).fadeIn();
                    setTimeout(function() {
                        $('.rotate-container').fadeOut(500,function(){ $(this).css('z-index', 0) });
                    }, 6000);
                    localStorage.setItem("cinema-alert", true);
                } else {
                    $('.rotate-container').fadeOut(500,function(){ $(this).css('z-index', 0) });
                }
            }else{
                $('.rotate-container').fadeOut(500,function(){ $(this).css('z-index', 0) });
            }
        }
        checkCinemaMode() {

            if(panableConfig.debug) console.log('checkCinemaMode');

            var ratio_mobile_portrait = 1.3;
            if (window.panableConfig.ratio_mobile_portrait) {
                ratio_mobile_portrait = window.panableConfig.ratio_mobile_portrait;
            }
            // Mode cinema for mobiles
            var wW = $(window).width();
            var wH = $(window).height();
        
            if (wH > wW) {
                var forceHeight = wW / ratio_mobile_portrait;
                $("#img1, #img2, #img3").height(
                    forceHeight
                );
                $("#img1, #img2, #img3").css({
                    "margin-top": ($(window).height() - forceHeight) / 2,
                });
            
            } else {

                let height = '100vh';
                if(window.isMobile){
                    // check mobile adress bar
                    const actualHeight = window.innerHeight;
                    const elementHeight = document.querySelector('#control-height').clientHeight;
                    const barHeight = elementHeight - actualHeight;

                    height = 'calc(100vh - '+barHeight+'px)';
                }
            
                $("#img1, #img2, #img3").height(height);
                $("#img1, #img2, #img3").css({
                    "margin-top": 0,
                });
            
            }
        }
        createPopup(message, addToLastMessage = false) {

            if (!window.panableConfig.debug) return;

            var debugPopupWrapper = document.getElementById("debugPopupWrapper");
            if(debugPopupWrapper === null){ 
                var debugPopupWrapper = document.createElement("div");
                document.body.appendChild(debugPopupWrapper);
                debugPopupWrapper.setAttribute("id","debugPopupWrapper");

                // Add CSS styles to the debugPopupWrapper
                debugPopupWrapper.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                debugPopupWrapper.style.color = "white";
                debugPopupWrapper.style.padding = "5px";
                debugPopupWrapper.style.fontSize = "9px";
                debugPopupWrapper.style.position = "fixed";
                debugPopupWrapper.style.top = `5%`;
                debugPopupWrapper.style.left = "5%";
                debugPopupWrapper.style.zIndex = "9999";
                debugPopupWrapper.style.display = "flex";
                debugPopupWrapper.style.flexDirection = "column";
            }

            if(!addToLastMessage || typeof this.popups[this.popups.length-1] == 'undefined'){
                // Create a new div element
                var popup = document.createElement("span");
    
                // Add the message to the popup
                popup.innerHTML = message;
    
                // Append the popup to the body
                debugPopupWrapper.appendChild(popup);
    
                // Add the popup to the array
                this.popups.push(popup);
        
                // Set a timeout to hide the popup after 3 seconds
                let self = this;
                setTimeout(function() {
                  //popup.style.display = "none";
                  popup.remove();
                  // Remove the popup from the array
                  var index = self.popups.indexOf(popup);
                  if (index > -1) {
                    self.popups.splice(index, 1);
                  }

                }, 4000);
            }else{
                // Add the message to the last popup
                this.popups[this.popups.length-1].innerHTML += message;
            }
        
        }
    }


    if (window.panableConfig.direction == 'vertical') {
        $('#scrollinfo').css('display', 'inline-block');
        $('#paninfo').css('display', 'none');
    } else {
        $('#scrollinfo').css('display', 'none');
        $('#paninfo').css('display', 'inline-block');
    }
    $('html').css('margin-top','0!important');
    // Change url images in mobile
    window.isMobile = false;
    window.isIOS = false;
    window.isSafari = false;

    var is_chrome = navigator.userAgent.indexOf('Chrome') > -1; 
    var is_explorer = navigator.userAgent.indexOf('MSIE') > -1; 
    var is_firefox = navigator.userAgent.indexOf('Firefox') > -1; 
    var is_safari = navigator.userAgent.indexOf("Safari") > -1; 
    var is_Opera = navigator.userAgent.indexOf("Presto") > -1; 
    if ((is_chrome)&&(is_safari)) {is_safari=false;} 

    window.isSafari = is_safari;

    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)/* || (window.isSafari && window.panableConfig.direction == 'horizontal')*/) {
        var imgs = document.querySelectorAll(".panableElement img");
        for (var i = 0; i < imgs.length; ++i) {
            var el = imgs[i];
            var urlSmall = el.getAttribute('data-src-mobile');
            if (urlSmall) imgs[i].dataset.image = urlSmall;
        }
        window.isMobile = true;
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.isIOS = true;
        }
    } else {
        var imgs = document.querySelectorAll(".panableElement img");
        for (var i = 0; i < imgs.length; ++i) {
            var el = imgs[i];
            var urlDesktop = el.getAttribute('data-src');
            if (urlDesktop) imgs[i].dataset.image = urlDesktop;
        }
    }

    

    // Override html config with params in url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString).entries();
    for(const entry of urlParams) {
        let key = entry[0];
        let value = entry[1];
        if(key == "bg") window.panableConfig[key] = value;
        else if (value) {
            window.panableConfig[key] = isNaN(value) ? value : Number(value);
        }
    }

    if (window.panableConfig.debug) {
        console.log('isMobile',isMobile);
        console.log('isIOS',isIOS);
        console.log('isSafari',isSafari);
    }

    

    // DOWNLOADING 
    document.getElementById("img3").src = document.getElementById('img3').dataset.image;
    document.getElementById("img2").src = document.getElementById('img2').dataset.image;
    document.getElementById("img1").src = document.getElementById('img1').dataset.image;
   
    setTimeout(() => {

        // Init panable
        let panableInstance = new Panable();
        panableInstance.initScene();

        
        if(window.panableConfig.popupColor == 'light') $('.rotate-container').addClass('light');
        

        setTimeout(() => {
                
            if (sessionStorage.hasOwnProperty("panable")) {
                $("#overlay").animate({ opacity: 0 }, 2500, function() {
                    $("#overlay").css("z-index", -1);
                    sessionStorage.setItem("panable", true);
                    if (window.panableConfig.direction == 'horizontal'){
                        panableInstance.showCinemaPopup();
                    }
                });

            } else {
                setTimeout(() => {
                    $("#overlay #prct").animate({ opacity: 0 }, 500, function() {
                        $("#overlay #prct").css('opacity',0);
                        $("#overlay #prct").css('z-index',0);
                        $("#overlay button").css('z-index',1);
                        $("#overlay button").animate({ opacity: 1 }, 500, function() {});
                    });
                }, 1300);

                $("#overlay button").click(function(e) {
                    $("#overlay").animate({ opacity: 0 }, 1000, function() {
                        $("#overlay").css("z-index", -1);
                        sessionStorage.setItem("panable", true);
                        if (window.panableConfig.direction == 'horizontal'){
                            panableInstance.showCinemaPopup();
                        }
                    });
                });
            }
        }, 300);

    }, 100);

    


});