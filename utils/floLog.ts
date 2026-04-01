/**
 * 프로젝트별 로그 모듈 (템플릿)
 *
 * Figma 정의서 기준으로 Action Log와 Mixpanel 이벤트를 분리하여 관리합니다.
 * 각 프로젝트에서 이 파일을 수정하여 사용하세요.
 *
 * @example
 * import { logAction, logMixpanel } from '@/utils/floLog'
 *
 * // 페이지 진입 시
 * logAction.pageEnter()
 * logMixpanel.pageView('main')
 *
 * // 버튼 클릭 시
 * logAction.clickButton()
 * logMixpanel.buttonClick('submit')
 */

import { actionLogger } from './actionLogger'
import { trackEvent } from './mixpanel'

// TODO: 프로젝트에 맞게 PAGE_ID 변경
const PAGE_ID = '/promotion/cms/karaoke-number'

// ============ Action Log (Figma 액션로그 정의서 기반으로 추가) ============

export const logAction = {
  /**
   * 페이지 진입
   */
  pageEnter() {
    actionLogger.send({
      pageId: PAGE_ID,
      categoryId: '/main',
      actionId: 'page_enter',
      body: { trace_refer: document.referrer },
    })
  },

  /**
   * 곡 검색 실행
   */
  searchSongs(keyword: string) {
    actionLogger.send({
      pageId: PAGE_ID,
      categoryId: '/search',
      actionId: 'search_keyword',
      body: { keyword },
    })
  },

  /**
   * 미리듣기 재생
   */
  playPreview(songId: string, songTitle: string) {
    actionLogger.send({
      pageId: PAGE_ID,
      categoryId: '/item',
      actionId: 'play_preview',
      body: { song_id: songId, song_title: songTitle },
    })
  },

  /**
   * 즐겨찾기 액션
   */
  favorite(songId: string, songTitle: string, isAdded: boolean, folderName?: string) {
    actionLogger.send({
      pageId: PAGE_ID,
      categoryId: '/item',
      actionId: isAdded ? 'add_favorite' : 'remove_favorite',
      body: { song_id: songId, song_title: songTitle, folder_name: folderName },
    })
  },

  /**
   * 전체/셔플 재생 시작 (F4)
   */
  playAll(folderName: string, songCount: number, isShuffle: boolean) {
    actionLogger.send({
      pageId: PAGE_ID,
      categoryId: '/favorites',
      actionId: isShuffle ? 'shuffle_play_all' : 'sequential_play_all',
      body: { folder_name: folderName, song_count: songCount },
    })
  },
}

// ============ Mixpanel (Figma 믹스패널로그 정의서 기반으로 추가) ============

export const logMixpanel = {
  /**
   * 페이지 뷰
   */
  pageView(tabName: string) {
    trackEvent('view_karaoke_page', {
      tab_name: tabName,
    })
  },

  /**
   * 곡 검색 완료
   */
  search(keyword: string, resultCount: number) {
    trackEvent('search_karaoke_song', {
      keyword,
      result_count: resultCount,
    })
  },

  /**
   * 재생 액션 (미리듣기 or 전체재생)
   */
  playAction(type: 'preview' | 'all' | 'shuffle', songTitle?: string, folderName?: string) {
    trackEvent('play_karaoke_action', {
      play_type: type,
      song_title: songTitle,
      folder_name: folderName,
    })
  },
}
