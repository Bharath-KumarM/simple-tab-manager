import { createMsgBanner } from "./msgBanner.js"

// increment the count of user using the extention
chrome.storage.local.get('userOpenCount', (value)=>{

    if (!value.userOpenCount){
        chrome.storage.local.set({'userOpenCount': 1})
    }
    else{
        const userOpenCount = value.userOpenCount +  1
        chrome.storage.local.set({userOpenCount})
        if (userOpenCount%100 === 0){
            createMsgBanner()
        }
    }

})