const msgBannerTemplateEle = document.getElementById('msg-banner-cnt')

// Customized Message Banner
export const createMsgBanner = (heading1Msg, heading2Msg)=>{
    const msgBannerCntEle = msgBannerTemplateEle.content.cloneNode(true).querySelector('.msg-banner-cnt')
    msgBannerCntEle.addEventListener('click', (e)=>{
        e.stopPropagation()
        msgBannerCntEle.remove()
    })
    if (heading1Msg){
        const heading1MsgEle = msgBannerCntEle.querySelector('.heading-1')
        heading1MsgEle.textContent = heading1Msg
    }
    if (heading2Msg){
        const heading2MsgEle = msgBannerCntEle.querySelector('.heading-2')
        heading2MsgEle.textContent = heading2Msg
    }
    document.getElementsByTagName('body')[0].prepend(msgBannerCntEle)
}