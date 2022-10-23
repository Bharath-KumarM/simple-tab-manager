import { processClosedTabs } from "./processClosedTabs.js"
import { processOpenTabs } from "./processOpenTabs.js"


//Tab Containers
const openTabCntEle =  document.getElementsByClassName('open tabs-cnt')[0]
const audioVideoTabCntEle =  document.getElementsByClassName('audio-video tabs-cnt')[0]
const closeTabCntEle =  document.getElementsByClassName('close tabs-cnt')[0]


const filterTabEleOnSearch = (tabCntEle, searchKeyWord)=>{
    //Filter open tabs
    const tabElements = tabCntEle.getElementsByClassName('single-tab')
    let countFilteredElements = 0

    for (const tabEle of tabElements){
        if (searchKeyWord.length === 0) {
            tabEle.style.display = 'grid'
            continue
        }
        const titleText = tabEle.getElementsByClassName('title')[0].textContent.toUpperCase()
        if (titleText.match(searchKeyWord)){
            tabEle.style.display = 'grid'
            continue
        }

        const urlText = tabEle.querySelector('.title-sub span').textContent.toUpperCase()
        if (urlText.match(searchKeyWord)){
            tabEle.style.display = 'grid'
            continue
        }
        tabEle.style.display = 'none'
        countFilteredElements++
    }

    const allTabsFilteredOut = countFilteredElements === tabElements.length 
    if (allTabsFilteredOut){
        tabCntEle.style.display = 'none'
    }
    else{
        tabCntEle.style.display = 'block'

    }
    return allTabsFilteredOut
}
// Search bar
export const onSearchBarInputChange = async (e)=>{
    const searchKeyWord = e.target.value.toUpperCase()

    let value //Place holder for locally stored object 

    //Get Tab View Mode from local storage
    value = await chrome.storage.local.get('openTabsViewMode')
    let openTabsViewMode = value.openTabsViewMode

    value = await chrome.storage.local.get('closeTabsViewMode')
    let closeTabsViewMode = value.closeTabsViewMode
    

    if (closeTabsViewMode !== 'T'){
        closeTabsViewMode = 'T'
        chrome.storage.local.set({closeTabsViewMode})
        processClosedTabs()
    }
    if (openTabsViewMode !== 'T'){
        openTabsViewMode = 'T'
        chrome.storage.local.set({openTabsViewMode})
        processOpenTabs()
    }


    //Filter open tabs
    const isAllOpenTabsFilteredOut = filterTabEleOnSearch(openTabCntEle, searchKeyWord)
    
    //Audio Tabs
    const isAllAudioTabsFilteredOut = filterTabEleOnSearch(audioVideoTabCntEle, searchKeyWord)
    
    
    //Filter closed tabs
    const isAllClosedTabsFilteredOut = filterTabEleOnSearch(closeTabCntEle, searchKeyWord)

    // All tabs no Removed
    if (isAllOpenTabsFilteredOut && isAllAudioTabsFilteredOut && isAllClosedTabsFilteredOut){
        if (!document.querySelector('.no-tabs-msg-cnt')){
            const noTabsFoundMsgEle = document.createElement('div')
            noTabsFoundMsgEle.classList.add('no-tabs-msg-cnt')
            noTabsFoundMsgEle.textContent = 'No Results Found'
            document.querySelector('body').appendChild(noTabsFoundMsgEle)
        }
    }
    else{
        if (document.querySelector('.no-tabs-msg-cnt')){
            document.querySelector('.no-tabs-msg-cnt').remove()
        }
    }
    
}