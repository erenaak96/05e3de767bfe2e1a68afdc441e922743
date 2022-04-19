// @ts-check

import { APIWrapper, API_EVENT_TYPE } from "./api.js";
import { addMessage, animateGift, isPossiblyAnimatingGift, isAnimatingGiftUI } from "./dom_updates.js";

const api = new APIWrapper();

const orderedEvent = []; //toplam sıralanmış event akışı
let isRunning = false; //evet akış bool
let ordering = 0; //loop start index
let animateQueue = []; //animasyon sırasına giren giftler
let animating = false;  //animasyon bool

function checkDuplicate(a){
  const seen = new Set();
  // console.log(a, "before");
    let newArr = a.filter(el => { //Gelen event datasından duplicated olanları eleyip sıralamaya gönderiyoruz
    const duplicate = seen.has(el.id);
    seen.add(el.id);
    return !duplicate;
  });
  // console.log(newArr," after");
  reOrderEvent(newArr);
}
  // checkDuplicate(arr);
function queueUpAnimate(){//animasyon sıramızı çalıştırıyoruz isAnimatingGiftUI tarafını kullanma ihtiyacı duymadım bu şekilde dilerseniz onuda kullanarak revizeleuyebilirim.
    setInterval(() => {
        if(animateQueue.length > 0){
          animating === true ? (animateGift(animateQueue[0]), animateQueue.shift()) :  console.log("sırada bekleyen animasyon yok")
        }else{
          // console.log("data kalmadı");
          animating = false; //data kalmadığı i.in animating stateini false çekerek animateGift'i tetiklememesini sağlama alıyoruz
        }
      }, 2000);
  }


function startRunning(){

    setInterval(() => {
     if(isRunning === true){
        //  console.log(ordering , orderedEvent.length);
         if(ordering < orderedEvent.length){
          orderedEvent[ordering].type === API_EVENT_TYPE.ANIMATED_GIFT ? (animateQueue.push(orderedEvent[ordering]),animating = true) : '';//Tipi ag olan eventi animasyon sırasına pushluyoruz
           addMessage(orderedEvent[ordering]);
          //  console.log(orderedEvent ,"ordered");
           ordering++;
         }else{
            // console.log("event kalmadı");
         }
     }
    }, 500);
  
}

function checkLength(){
 setInterval(() => {
  ordering <= orderedEvent.length ? isRunning = true : isRunning = false // Sıranın toplam mesaj uzunlugunu geçmemesi için eventi kontrol ediyoruz genelde bu tarz işlemleri vue,vuex tarafında çözdüğüm için vanillada interval kullanmak pratik geldi
  // console.log(isRunning);
 }, 100);
}

function reOrderEvent(e){

  const [ag, g, m] = [[],[],[]];
    e.sort(function(x, y){ //Read.me'de bununla ilgili birşey görmedim ama yinede önce zamana sonra tipe göre sıralamak daha uygun geldi.
        return x.timestamp - y.timestamp;
    })
    e.map( i =>{//Türe göre Parçalıyoruz
      i.type  ==  API_EVENT_TYPE.ANIMATED_GIFT ? ag.push(i) : i.type  ==  API_EVENT_TYPE.MESSAGE ? m.push(i) : g.push(i);
    }); 
    orderedEvent.push(...ag);//Toplam mesajlara pushluyoruz
    orderedEvent.push(...m);
    orderedEvent.push(...g);
    //  startRunning();
    

}

api.setEventHandler((event) => {
  
  // ...
  !event.length ? console.log("empty ev") : checkDuplicate(event); //eventi kontrol edip sıralıyoruz
  // console.log("---------------------------------");
  
})
checkLength();//Run evs
startRunning();
queueUpAnimate();
// NOTE: UI helper methods from `dom_updates` are already imported above.
