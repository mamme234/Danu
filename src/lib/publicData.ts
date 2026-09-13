import { api } from './api'
import type { Service, Doctor, Facility, FaqItem, Article, ContentBlock } from './types'

export interface PublicPayload {
  services: Service[]
  doctors: Doctor[]
  facilities: Facility[]
  faq: FaqItem[]
  articles: Article[]
  blocks: ContentBlock[]
}

export function fetchPublic() {
  return api.get<PublicPayload>('public')
}

export function fetchServices() {
  return api.get<{ services: Service[] }>(`content?resource=services`).then(r => r.data)
}

export function fetchDoctors() {
  return api.get<{ doctors: Doctor[] }>(`content?resource=doctors`).then(r => r.data)
}

export function fetchFacilities() {
  return api.get<{ facilities: Facility[] }>(`content?resource=facilities`).then(r => r.data)
}

export function fetchFaq() {
  return api.get<{ faq: FaqItem[] }>(`content?resource=faq_items`).then(r => r.data)
}

export function fetchArticles() {
  return api.get<{ articles: Article[] }>(`content?resource=articles`).then(r => r.data)
}
