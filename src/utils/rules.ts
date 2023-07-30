const REDIRECT = chrome.declarativeNetRequest.RuleActionType.REDIRECT
const MAIN_FRAME = chrome.declarativeNetRequest.ResourceType.MAIN_FRAME
const SUB_FRAME = chrome.declarativeNetRequest.ResourceType.SUB_FRAME
const XMLHTTPREQUEST = chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST

const REDIRECT_BLOCKED_PAGE = '/src/blocked/blocked.html'

export async function setBlockRules(urls: Array<string>) {
  urls.forEach((domain: string, index: number) => {
    let id = index + 1

    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: id,
          priority: 1,
          action: {
            type: REDIRECT,
            redirect: {
              extensionPath: REDIRECT_BLOCKED_PAGE,
            },
          },
          condition: {
            urlFilter: formatUrlIntoFilter(domain),
            resourceTypes: [MAIN_FRAME, SUB_FRAME, XMLHTTPREQUEST],
          },
        },
      ],
      removeRuleIds: [id],
    })
  })
}

export async function deleteRulesByUrl(urls: Array<string>) {
  const currentRules = await getRules()
  const formattedUrls = urls.map((url) => formatUrlIntoFilter(url))
  const idsToRemove = currentRules
    .map((el, index) => {
      if (formattedUrls.includes(el.condition.urlFilter)) {
        return index
      }
    })
    .filter((el) => el)
  await deleteRulesById(idsToRemove)
}

async function deleteRulesById(ids: Array<number>) {
  ids.forEach((id: number) => {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [id],
    })
  })
}
export async function resetBlockRules() {
  const currentRules = await getRules()
  currentRules.forEach(({ id }) => {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [id],
    })
  })
}

export async function getRules() {
  return chrome.declarativeNetRequest.getDynamicRules()
}

export function formatUrlIntoFilter(url: string) {
  return `||${url}`
}