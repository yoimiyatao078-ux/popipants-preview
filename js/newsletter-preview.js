/* palette previews: newsletter popup (replaces "secret club" copy on these pages).
   Opens from the click-me button, or once per session ~25s in / after scrolling 40%.
   Uses window.popiSubscribe. With no endpoint, nothing is saved and no list confirmation is shown. */
(function(){
  var SEEN='popipants-nl-shown';
  function open(){
    if(document.querySelector('.pc-popup-overlay'))return false;
    try{sessionStorage.setItem(SEEN,'1');}catch(e){}
    var ret=document.activeElement,ov=document.createElement('div');ov.className='pc-popup-overlay nl-overlay';
    ov.innerHTML='<div class="pc-popup signup-popup" role="dialog" aria-modal="true" aria-label="Newsletter sign-up">'+
      '<div class="pc-popup-titlebar"><span>popi-newsletter.exe</span><button type="button" class="close-btn" aria-label="Close">X</button></div>'+
      '<div class="pc-popup-body"><p>✿ <b>new drops and restocks</b><br>Leave your email when the shop list is connected.</p>'+
      '<form class="signup-form"><p class="signup-note" id="nl-note"></p><label for="nl-email">your email</label><input id="nl-email" type="email" placeholder="angel@email.com" required autocomplete="email" aria-describedby="nl-note nl-msg"><button class="popup-btn" type="submit">join the list ♡</button>'+
      '<p class="sx-msg" id="nl-msg" role="status" aria-live="polite"></p></form>'+
      '<button type="button" class="nl-nothanks">no thanks</button></div></div>';
    document.body.appendChild(ov);
    function close(){ov.remove();document.removeEventListener('keydown',key);if(ret&&ret.focus)ret.focus();}
    function key(e){if(e.key==='Escape')close();}
    document.addEventListener('keydown',key);
    ov.addEventListener('click',function(e){if(e.target===ov||e.target.closest('.close-btn,.nl-nothanks'))close();});
    var note=ov.querySelector('#nl-note');
    note.textContent=window.popiSignupNote?popiSignupNote():'Signup isn\'t available yet. Your email is not saved.';
    ov.querySelector('form').addEventListener('submit',function(e){
      e.preventDefault();
      var input=ov.querySelector('#nl-email'),msg=ov.querySelector('#nl-msg'),btn=ov.querySelector('.popup-btn'),v=input.value.trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){msg.textContent='that email looks a little off — try again?';input.setAttribute('aria-invalid','true');input.focus();return;}
      input.removeAttribute('aria-invalid');
      btn.disabled=true;
      var ready=window.POPI_CONFIG&&POPI_CONFIG.newsletter&&POPI_CONFIG.newsletter.endpoint;
      if(ready)msg.textContent='sending…';
      var send=window.popiSubscribe?popiSubscribe(v,'palette'):Promise.resolve({sent:false,unavailable:true});
      send.then(function(r){
        btn.disabled=false;
        if(r&&r.sent){
          ov.querySelector('.pc-popup-body').innerHTML='<p>You’re on the list. Check your inbox to confirm.</p><button type="button" class="popup-btn">close</button>';
          ov.querySelector('.popup-btn').addEventListener('click',close);ov.querySelector('.popup-btn').focus();
          return;
        }
        msg.textContent=window.popiSignupNote?popiSignupNote():'Signup isn\'t available yet. Your email is not saved.';
      },function(){btn.disabled=false;msg.textContent='The mailing list didn’t respond. Nothing was saved — try again.';});
    });
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
