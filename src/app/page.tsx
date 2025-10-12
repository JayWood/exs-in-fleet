export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-[url('/background.jpg')] bg-cover bg-center">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="card card-border bg-base-100/80 w-96">
          <div className="card-body justify-center items-center flex flex-col">
            <h2 className="card-title">Ex's In Fleet</h2>
            <p>
              To use this tool you must be whitelisted, contact Sprygor in game
              for access.
            </p>
            <div className="card-actions justify-center m-3">
              <a href="/admin">
                <img
                  src="/eve-sso-login-black-large.png"
                  alt="Login with Eve Online"
                />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
