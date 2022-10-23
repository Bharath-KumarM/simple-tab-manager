import { getAgoTime, getUrlDomin} from "./utilities.js"
import { createCollapsedTabEle } from "./collapsedWindow.js"

//Template
const closeTabCntEle =  document.getElementsByClassName('close tabs-cnt')[0]
const singleTabTemplateEle = document.getElementById('single-tab')

const createNewCloseTabEle = (tab)=>{
    // closed window element 
    const closedWindowEle = closeTabCntEle.querySelector(`[data-window-id="${tab.windowId}"]`)
    if (closedWindowEle){
        if (closedWindowEle.dataset.windowType === 'collapsed'){
            const closedWindowTabCnt = closedWindowEle.querySelector('.win-col-tab-cnt')
            createCollapsedTabEle(tab, closedWindowTabCnt)
        }
    }
    else{
        const closeTabsInnerCnt = closeTabCntEle.querySelector('.tabs-inner-cnt')
        const closedTabEle = createSingleTabEle(tab)
        closeTabsInnerCnt.prepend(closedTabEle)
    }
}

export const createSingleTabEle = (tab) =>{
    
    const isOpenWindow = tab.windowId ? true : false
    const isOpenTab = tab.id  ? true : false

    // Sigle Tab Template
    let singleTabEle = singleTabTemplateEle.content.cloneNode(true)
    //fix to make it an HTML element but not fragment
    singleTabEle = singleTabEle.querySelector('.single-tab') 

    // fav icon
    const favIconEle = singleTabEle.querySelector('.fav-icon')
    if (tab.favIconUrl) favIconEle.setAttribute('src', tab.favIconUrl)

    // title
    const titleEle = singleTabEle.querySelector('.title')
    titleEle.textContent = tab.title

    // url & time
    const titleSubEle = singleTabEle.querySelector('.title-sub')
    const urlEle = titleSubEle.getElementsByTagName('span')[0]
    if (tab.url) urlEle.textContent = getUrlDomin(tab.url) + ' • '
    const timeEle = titleSubEle.getElementsByTagName('span')[1]
    timeEle.textContent = ''
    timeEle.textContent = ' ' + getAgoTime(tab.time)


    
    if (tab.audible){
        // Audio Idicator
        const audioDotEle = singleTabEle.querySelector('.audio-dot')
        audioDotEle.classList.add('active')
        //Speaket Btn
        const speakerBtnEle = document.createElement('span')
        speakerBtnEle.classList.add('material-symbols-outlined')
        speakerBtnEle.classList.add('speaker-btn')
        if (tab.mutedInfo.muted) {
            speakerBtnEle.textContent = 'volume_off'
            speakerBtnEle.classList.add('mute')
        }
        else {
            speakerBtnEle.textContent = 'volume_up'
            speakerBtnEle.classList.remove('mute')
        }
        //Speaker Btn Click event
        speakerBtnEle.addEventListener('click', (e)=>{
            e.stopPropagation()
            //Swap 
            chrome.tabs.get(tab.id,(newTab)=>{
                const isMuted = !newTab.mutedInfo.muted
                if (isMuted) {
                    speakerBtnEle.textContent = 'volume_off'
                    speakerBtnEle.classList.add('mute')
                } 
                else{
                    speakerBtnEle.textContent = 'volume_up'
                    speakerBtnEle.classList.remove('mute') 
                }
                chrome.tabs.update(newTab.id, {muted: isMuted})
            })
            
        })
        titleEle.prepend(speakerBtnEle)
    }


    // Tab Click
    singleTabEle.addEventListener('click', (e)=>{
        e.stopPropagation()
        if (isOpenWindow){
            chrome.windows.update(tab.windowId, {focused: true}).then(()=>{
                if (isOpenTab){
                    chrome.tabs.update(tab.id, {active: true})
                }
                else{
                    chrome.tabs.create({active: true, url: tab.url, windowId: tab.windowId})
                }
            })
        }
        else {
            chrome.tabs.create({active: true, url: tab.url})
        }
    })

    // Close Click
    const closeTabBtnEle = singleTabEle.querySelector('.close-btn') 
    if (!isOpenTab){
        // Closed tabs don't have close btn
        closeTabBtnEle.remove()
    }
    else{ 
        closeTabBtnEle.addEventListener('click', (e)=>{
            e.stopPropagation()
            chrome.tabs.remove(tab.id)
            singleTabEle.remove()
            delete tab.id
            createNewCloseTabEle(tab)
        })
    }
    return singleTabEle
}