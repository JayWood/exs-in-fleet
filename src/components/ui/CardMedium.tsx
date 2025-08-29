'use client'

const CardMedium = ({ className = null, cardTitle = '', children }) => (
  <div
    className={'card card-border bg-base-100 card-md shadow-sm ' + className}
  >
    <div className="card-body">
      <h2 className="card-title">{cardTitle}</h2>
      {children}
    </div>
  </div>
)

export default CardMedium
