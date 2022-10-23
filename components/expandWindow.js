import { getAgoTime, getRandomColor, getUrlDomin } from "./utilities.js"
//Template
const winExpandTemplateEle = document.getElementById('win-expand')



export const createExapndWindow = (window, time, isWindowActive)=>{

    // Decode Window Id and it is opened or closed
    const isOpenWindow =  window[0].windowId ? true : false
    const isOpenTabs =  window[0].id  ? true : false

    //Expand window element
    let winExpandEle = winExpandTemplateEle.content.cloneNode(true)
    winExpandEle = winExpandEle.querySelector('.win-expand')
    
    //Time desc
    const windowTimeEle = winExpandEle.querySelector('.time')
    windowTimeEle.textContent = getAgoTime(time)

    //Single tab template Element
    const singleTabTempEle = winExpandEle.querySelector('.single-tab')
    singleTabTempEle.remove()
    
    //Stripe
    const stripeEle = winExpandEle.querySelector('.stripe')
    const stripeColor = getRandomColor()
    
    //Create single tabs for window
    window.map((tab)=>{
        let singleTabEle = singleTabTempEle.cloneNode(true)
        
        // fav icon
        const favIconEle = singleTabEle.querySelector('.fav-icon')
        if (tab.favIconUrl) favIconEle.setAttribute('src', tab.favIconUrl)
    
        // title
        const titleEle = singleTabEle.querySelector('.title')
        titleEle.textContent = tab.title

        //Stripe
        const stripeEle = singleTabEle.querySelector('.stripe')
        stripeEle.style.backgroundColor = stripeColor

        // url & time
        const titleSubEle = singleTabEle.querySelector('.title-sub')
        const urlEle = titleSubEle.getElementsByTagName('span')[0]
        urlEle.textContent = getUrlDomin(tab.url) + ' • '
        const timeEle = titleSubEle.getElementsByTagName('span')[1]
        timeEle.textContent = ''
        if (tab.time){
            timeEle.textContent = ' ' + getAgoTime(tab.time)
            
        }
        else if (openTabsStored[tab.id]){
            const storedTab = openTabsStored[tab.id]
            timeEle.textContent = ' ' + getAgoTime(storedTab.time)
        }
        else console.log(tab)

        //Audio Dot indicator
        if (tab.audible){
            const audioDotEle = singleTabEle.querySelector('.audio-dot')
            audioDotEle.classList.add('active')
        }

        //Active
        if (tab.active) singleTabEle.classList.add('active')

        // Add Element to DOM
        winExpandEle.append(singleTabEle)
        singleTabEle = winExpandEle.lastElementChild

 
        // Tab Click
        singleTabEle.addEventListener('click', (e)=>{
            e.stopPropagation()
            if (isOpenWindow){
                chrome.windows.update(tab.windowId, {focused: true}, 
                    ()=>{
                        if (isOpenTabs)
                            chrome.tabs.update(tab.id, {active: true})
                        else 
                            chrome.tabs.create({active: true, url: tab.url, windowId: tab.windowId})
                    })
            }
            else{
                chrome.tabs.create({active: true, url: tab.url})
            }
        })

        // Close Btn
        const closeTabBtnEle = singleTabEle.querySelector('.close-btn')
        if (isOpenTabs){

            closeTabBtnEle.addEventListener('click', (e)=>{
    
                // filter the window object to reflect the changes while creating the collapsed winowd
                window = window.filter((filterTab)=>filterTab.id !== tab.id)
                e.stopPropagation()
                chrome.tabs.remove(tab.id)
                singleTabEle.remove()
                delete tab.id
                createNewCloseTabEle(tab)
            })
        }
        else{
            closeTabBtnEle.remove()
        }

    })

    const toMinimizeBtn = winExpandEle.querySelector('.minimize')
    toMinimizeBtn.addEventListener('click', (e)=>{
        e.stopPropagation()
        const exapndWinEle = createCollapsedWindow(window, time, isWindowActive)
        winExpandEle.parentElement.insertBefore(exapndWinEle, winExpandEle)
        winExpandEle.remove()
    })

    return winExpandEle

}

export const createAllExpandWindows = (windows, winIdsSrtByTime, activeWindowId)=>{
    const allExpandWindowsEle = document.createElement('div')
    allExpandWindowsEle.classList.add('tabs-inner-cnt')
    for (const {windowId, time} of winIdsSrtByTime){
        const  isWindowActive = windowId == activeWindowId
        // Creates Expand Window
        const expandWindowEle = createExapndWindow(windows[windowId], time, isWindowActive)
        allExpandWindowsEle.appendChild(expandWindowEle)
    }
    return allExpandWindowsEle
}