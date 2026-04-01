'use client'

import { ChangeEvent, FormEvent, useRef } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = '곡명이나 아티스트명으로 검색해보세요',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSearch(value.trim())
      // 모바일 키보드 닫기
      inputRef.current?.blur()
    }
  }

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full h-[56px] bg-[var(--color-surface-primary)] rounded-[28px] px-[20px] transition-colors focus-within:ring-2 focus-within:ring-[var(--color-static-accent)]"
    >
      <svg
        className="size-[24px] text-[var(--color-icon-subtle)] mr-[8px] flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 21L16.65 16.65"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none text-[16px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)]"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center justify-center size-[24px] rounded-full bg-[var(--color-icon-disabled)] text-[var(--color-surface-bg)] ml-[8px] flex-shrink-0"
          aria-label="검색어 지우기"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </form>
  )
}
