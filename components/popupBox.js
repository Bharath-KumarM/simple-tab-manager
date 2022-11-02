const popupCntTemplateEle = document.getElementById('popup-box-cnt')

export const createPopupScreen = (heading1, heading2, handleYesBtnCick, handleNoBtnCick)=>{
    const popScreenCntEle = popupCntTemplateEle.content.cloneNode(true).querySelector('.popup-box-cnt')
    if(heading1){
        const heading1Ele = popScreenCntEle.querySelector('.popup-box-heading1')
        heading1Ele.textContent = heading1
    }
    if (heading2){
        const heading2Ele = popScreenCntEle.querySelector('.popup-box-heading2')
        heading2Ele.textContent = heading2
    }

    const yesBtnEle = popScreenCntEle.querySelector('.popup-box-yes-btn')
    yesBtnEle.addEventListener('click', ()=>{
        popScreenCntEle.remove()
        if(handleYesBtnCick) handleYesBtnCick()
    })

    const noBtnEle = popScreenCntEle.querySelector('.popup-box-no-btn')
    noBtnEle.addEventListener('click', ()=>{
        popScreenCntEle.remove()
        if(handleNoBtnCick) handleNoBtnCick()
    })



    document.querySelector('body').prepend(popScreenCntEle)
}
