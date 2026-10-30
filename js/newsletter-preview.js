/* palette previews: neutral 10%-off newsletter popup (replaces "secret club" copy).
   Opens from the click-me button, or once per session ~25s in / after scrolling 40%.
   Demo only: no email backend exists; addresses are kept in this browser's localStorage ('popipants-newsletter'). */
(function(){
  var SEEN='popipants-nl-shown';
  function open(){
    if(document.querySelector('.pc-popup-overlay'))return false;
    try{sessionStorage.setItem(SEEN,'1');}catch(e){}
    var ret=document.activeElement,ov=document.createElement('div');ov.className='pc-popup-overlay nl-overlay';
    ov.innerHTML='<div class="pc-popup signup-popup" role="dialog" aria-modal="true" aria-label="Newsletter sign-up, 10% off">'+
      '<div class="pc-popup-titlebar"><span>popi-newsletter.exe</span><button type="button" class="close-btn" aria-label="Close">X</button></div>'+
      '<div class="pc-popup-body"><p>✿ <b>get 10% off your first order</b><br>Join the popipants list for new drops, restocks and little surprises.</p>'+
      '<form class="signup-form"><label for="nl-email">your email</label><input id="nl-email" type="email" placeholder="angel@email.com" required autocomplete="email"><button class="popup-btn" type="submit">get my 10% ♡</button></form>'+
      '<button type="button" class="nl-nothanks">no thanks</button></div></div>';
    document.body.appendChild(ov);
    function close(){ov.remove();document.removeEventListener('keydown',key);if(ret&&ret.focus)ret.focus();}
    function key(e){if(e.key==='Escape')close();}
    document.addEventListener('keydown',key);
    ov.addEventListener('click',function(e){if(e.target===ov||e.target.closest('.close-btn,.nl-nothanks'))close();});
    ov.querySelector('form').addEventListener('submit',function(e){e.preventDefault();var v=ov.querySelector('#nl-email').value;
      try{var l=JSON.parse(localStorage.getItem('popipants-newsletter'))||[];l.push({email:v,at:new Date().toISOString()});localStorage.setItem('popipants-newsletter',JSON.stringify(l));}catch(err){}
      ov.querySelector('.pc-popup-body').innerHTML='<p>♡ you are on the list! your 10% code will come with the first newsletter.</p><button type="button" class="popup-btn">close</button>';
      ov.querySelector('.popup-btn').addEventListener('click',close);ov.querySelector('.popup-btn').focus();});
    setTimeout(function(){var i=ov.querySelector('#nl-email');if(i)i.focus();},50);
    return true;
  }
  document.addEventListener('click',function(e){var t=e.target.closest('[data-popup="signup"]');if(!t)return;e.stopImmediatePropagation();e.preventDefault();open();},true);
  var auto=function(){try{if(sessionStorage.getItem(SEEN))return;}catch(e){}
    if(document.querySelector('.ppw-overlay, .pc-popup-overlay')){setTimeout(auto,5000);return;}
    if(open())off();};
  var t=setTimeout(auto,25000);
  function onScroll(){var h=document.documentElement;if((h.scrollTop+innerHeight)/h.scrollHeight>.4)auto();}
  function off(){clearTimeout(t);removeEventListener('scroll',onScroll);}
  addEventListener('scroll',onScroll,{passive:true});
  window.popipantsNewsletter={open:open};
})();
