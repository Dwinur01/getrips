import React from 'react'

function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl animate-fade-in my-4">
      <div className="bg-primary-light text-primary p-4 rounded-full mb-4 animate-bounce-slow">
        {Icon ? <Icon className="w-8 h-8" /> : null}
      </div>
      <h4 className="font-display font-bold text-sm text-gray-700 mb-1">{title}</h4>
      <p className="text-xs text-gray-500 max-w-sm leading-relaxed mb-4">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-2 text-xs font-semibold active:scale-95 transition-all shadow-soft"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
