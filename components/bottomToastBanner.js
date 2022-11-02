const bottomToastTemplateEle = document.getElementById('bottom-toast-banner')
const bottomToastCntEle = document.querySelector('.bottom-toast-banner-cnt')

// Customized Message Banner
export const createbottomToastBanner = (description, handleUndoBtnClick)=>{
    const bottomToastEle = bottomToastTemplateEle.content.cloneNode(true).querySelector('.bottom-toast-banner')
    bottomToastEle.addEventListener('click', (e)=>{
        e.stopPropagation()
        bottomToastEle.remove()
    })
    if (description){
        const bottomToastDescEle = bottomToastEle.querySelector('.bottom-toast-banner-desc')
        bottomToastDescEle.textContent = description
    }


    const undoBtnEle = bottomToastEle.querySelector('.bottom-toast-banner-undo-btn')
    if (handleUndoBtnClick){
        undoBtnEle.addEventListener('click', handleUndoBtnClick)
    }
    else{
        undoBtnEle.remove()
    }

    bottomToastEle.classList.add('active')
    bottomToastCntEle.append(bottomToastEle)
    setTimeout(()=>{
        bottomToastEle.classList.add('inactive')
        bottomToastEle.addEventListener('transitionend', ()=>{
            bottomToastEle.remove()
        })
    }, 5000)
}