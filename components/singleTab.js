import { getAgoTime, getUrlDomin} from "./utilities.js"
import { createCollapsedTabEle } from "./collapsedWindow.js"
import { processOpenTabs } from "./processOpenTabs.js"
import { createbottomToastBanner } from "./bottomToastBanner.js"

//Template
const closeTabCntEle =  document.getElementsByClassName('close tabs-cnt')[0]
const singleTabTemplateEle = document.getElementById('single-tab')

const createNewCloseTabEle = (tab)=>{
    // closed window element 
    const closedWindowEle = closeTabCntEle.querySelector(`[data-window-id="${tab.windowId}"]`)
    if (closedWindowEle && closedWindowEle.dataset.windowType === 'collapsed'){
        const closedWindowTabCnt = closedWindowEle.querySelector('.win-col-tab-cnt')
        createCollapsedTabEle(tab, closedWindowTabCnt)
    }
    else{
        const closeTabsInnerCnt = closeTabCntEle.querySelector('.tabs-inner-cnt')
        const closedTabEle = createSingleTabEle(tab)
        closeTabsInnerCnt.prepend(closedTabEle)
    }
}

export const createSingleTabEle = (tab) =>{
    //Identify Window and Tab status
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
    const titleEle = singleTabEle.querySelector('.title span')
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
        //Title Element
        singleTabEle.querySelector('.title').prepend(speakerBtnEle)
    }


    // Tab Click
    singleTabEle.addEventListener('click', (e)=>{
        e.stopPropagation()
        if (isOpenWindow){
            chrome.windows.update(tab.windowId, {focused: true}).then(()=>{
                if (isOpenTab) chrome.tabs.update(tab.id, {active: true})
                else chrome.tabs.create({active: true, url: tab.url, windowId: tab.windowId})
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
        // Close Tab Btn Click Listeners
        closeTabBtnEle.addEventListener('click', (e)=>{
            e.stopPropagation()
            chrome.tabs.remove(tab.id).then(()=>{
                // Bottom Toast Banner for users
                createbottomToastBanner('Tab Closed Successfully', ()=>{
                    chrome.windows.get(tab.windowId).then(()=>{
                        let index = -1
                        if (tab.index) index = tab.index
                        chrome.tabs.create({windowId: tab.windowId, active: true, url: tab.url, index})
                    }).catch(()=>chrome.tabs.create({active: true, url: tab.url}))
                })
            }).catch(()=>{
                createbottomToastBanner('Tab Close UnSuccessfully! Refresh Once')
            })
            singleTabEle.remove()
            delete tab.id
            createNewCloseTabEle(tab)
        })
    }
    // Add tabId and windowId data to elements
    singleTabEle.dataset.tabId = tab.id
    singleTabEle.dataset.windowId = tab.windowId
    singleTabEle.draggable = true

    if (isOpenTab){
        singleTabEle.addEventListener('dragstart', (e)=>{
            e.preventDefault()
            // Create Banner and for undo button pass a function to force 'T' view mode 
            createbottomToastBanner('View Mode Changed to Drag Tabs, Now Drag', ()=>{
                let openTabsViewMode = 'T'
                chrome.storage.local.set({openTabsViewMode}).then(()=>{
                    processOpenTabs()
                })
            })
            // Drop drag available only to View By Window mode. So, force it
            let openTabsViewMode = 'E'
            chrome.storage.local.set({openTabsViewMode}).then(()=>{
                processOpenTabs()
            })
        }) 
    }

    return singleTabEle
}