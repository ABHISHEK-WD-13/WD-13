function rukojara(){
 var h1=document.querySelector("h1");
 var x=h1.style.marginTop;
 var int=parseInt(x);
 var y=h1.style.marginBottom;
 var int1=parseInt(y);
setInterval(() => { if(document.querySelector("h1").style.marginTop!=="100px"){
	 int=int-1; 
	document.querySelector("h1").style.marginTop=int+"px";
	}

	 else if(document.querySelector("h1").style.marginBottom!=="0px"){
	 	int1=int1-1;
	 	 document.querySelector("h1").style.marginBottom=int1+"px";
	 }
  }, 0.01);

}
setTimeout(rukojara, 1000 );

$(window).scroll(function() {
		

        
    var scrollTop = $(window).scrollTop();

    if (scrollTop >= 100) {
        
        $('nav').addClass('solid-navbar');
    } else {
        
        $('nav').removeClass('solid-navbar');
    }

});
