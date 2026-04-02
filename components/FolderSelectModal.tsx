'use client'

import { useState, useEffect } from 'react'
import { BodyText, DetailText, Heading } from './ui/Text'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Spinner } from './ui/Spinner'
import { getFolders, createFolder, type FolderRow } from '@/db/folders'

interface FolderSelectModalProps {
  memberNo: string
  isOpen: boolean
  onClose: () => void
  onSelect: (folderId: string) => void
  onFolderCreated?: () => void
  defaultShared?: boolean
  currentFolderIds: string[]
}

export function FolderSelectModal({ 
  memberNo, 
  isOpen, 
  onClose, 
  onSelect, 
  onFolderCreated,
  defaultShared = false,
  currentFolderIds = []
}: FolderSelectModalProps) {
  const [folders, setFolders] = useState<FolderRow[]>([])
  const [newFolderName, setNewFolderName] = useState('')
  const [isShared, setIsShared] = useState(defaultShared)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsShared(defaultShared)
    }
  }, [isOpen, defaultShared])

  useEffect(() => {
    if (isOpen && memberNo) {
      loadFolders()
    }
  }, [isOpen, memberNo])

  const loadFolders = async () => {
    setIsLoading(true)
    try {
      const data = await getFolders(memberNo)
      setFolders(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    setIsCreating(true)
    try {
      const newFolder = await createFolder(newFolderName.trim(), memberNo, isShared)
      setFolders(prev => [newFolder, ...prev])
      setNewFolderName('')
      setIsShared(false) // 초기화
      
      // 부모 목록 갱신 요청
      if (onFolderCreated) onFolderCreated()
      
      // 사용자 편의: 생성 후 즉시 해당 폴더로 곡 담기 진행
      alert(`'${newFolder.name}' 폴더가 생성되었습니다! ✨`)
      onSelect(newFolder.id)
    } catch (err) {
      console.error('폴더 생성 실패:', err)
      alert('폴더를 생성하지 못했습니다. 다시 시도해주세요.')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center">
      {/* Background Dim */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Modal Content */}
      <Card className="relative w-full max-w-[360px] bg-[var(--color-surface-secondary)] rounded-t-[24px] sm:rounded-[24px] flex flex-col max-h-[80vh] animate-in slide-in-from-bottom duration-300 overflow-hidden shadow-2xl">
        <div className="flex items-start justify-between p-[20px] pb-[12px]">
          <div className="flex flex-col gap-[4px]">
            <Heading level={3}>📁 폴더 선택</Heading>
            <DetailText className="text-[var(--color-text-tertiary)] !text-[12px]">담거나 뺄 폴더를 골라주세요</DetailText>
          </div>
          <button onClick={onClose} className="p-[4px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors mt-[2px]">
            <svg className="size-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-[20px] pt-0 scrollbar-hide">
          
          {isLoading ? (
            <div className="flex justify-center py-[40px]">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-[8px]">
              {folders.map((folder) => {
                const isIncluded = currentFolderIds.includes(folder.id)
                return (
                  <button
                    key={folder.id}
                    onClick={() => onSelect(folder.id)}
                    className={`flex items-center justify-between p-[14px] rounded-[14px] active:scale-[0.98] transition-all border text-left ${isIncluded ? 'bg-white shadow-sm border-[var(--color-static-accent)]' : 'bg-[var(--color-surface-bg)] border-[var(--color-border)] hover:bg-[var(--color-surface-tertiary)]'}`}
                  >
                    <div className="flex items-center gap-[6px] flex-1 truncate">
                      <BodyText className={`truncate ${isIncluded ? 'text-[var(--color-static-accent)] font-bold' : ''}`}>{folder.name}</BodyText>
                      {folder.is_shared && (
                        <span className="shrink-0 text-[12px] bg-[var(--color-static-accent)] text-white px-[4px] py-[1px] rounded-[4px] font-bold">👥</span>
                      )}
                    </div>
                    {isIncluded ? (
                      <div className="size-[20px] bg-[var(--color-static-accent)] rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                        <svg className="size-[12px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <svg className="size-[18px] text-[var(--color-icon-tertiary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                )
              })}

              {/* 새 폴더 생성 영역 */}
              <div className="mt-[16px] pt-[16px] border-t border-[var(--color-border)] flex flex-col gap-[10px]">
                <div className="flex justify-between items-center px-[4px]">
                  <BodyText className="text-[13px] text-[var(--color-text-tertiary)]">새 폴더 만들기</BodyText>
                  
                  {/* F6: 공동 편집 토글 */}
                  <button 
                    onClick={() => setIsShared(!isShared)}
                    className={`flex items-center gap-[4px] px-[8px] py-[3px] rounded-full transition-all text-[11px] font-bold border ${isShared ? 'bg-[var(--color-static-accent)] text-white border-[var(--color-static-accent)]' : 'bg-transparent text-[var(--color-text-tertiary)] border-[var(--color-border)]'}`}
                  >
                    <span>{isShared ? '👥 함께 노래하기 On' : '👥 함께 노래하기!'}</span>
                  </button>
                </div>
                
                <div className="flex gap-[6px] items-center">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="폴더명"
                    className="flex-1 bg-[var(--color-surface-bg)] border border-[var(--color-border)] rounded-[10px] px-[12px] py-[10px] text-[15px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-static-accent)] placeholder:text-[var(--color-text-tertiary)]"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  />
                  <Button 
                    size="sm" 
                    variant="primary" 
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim() || isCreating}
                    className="shrink-0 !h-[42px] !px-[16px] !text-[15px]"
                  >
                    생성
                  </Button>
                </div>
                {isShared && (
                  <p className="text-[11px] text-[var(--color-static-accent)] ml-[6px] font-medium animate-pulse">
                    * 친구에게 링크를 공유해 함께 리스트를 만들 수 있어요!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
