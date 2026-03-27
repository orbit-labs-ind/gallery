import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { IoImage } from 'react-icons/io5'
import { login } from '../store/slices/authSlice'
import { sendOtp, verifyOtp } from '../api/auth'
import './LoginPage.css'

const OTP_LENGTH = 6

const emptyOtpCells = () => Array(OTP_LENGTH).fill('')

function isValidEmail(value) {
  const v = value.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function LoginPage() {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otpCells, setOtpCells] = useState(emptyOtpCells)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const otpRefs = useRef([])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const otpString = otpCells.join('')
  const normalizedEmail = email.trim().toLowerCase()

  useEffect(() => {
    if (step !== 'otp') return
    const id = requestAnimationFrame(() => {
      otpRefs.current[0]?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [step])

  const setOtpAt = (index, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    setOtpCells((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const onOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCells[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const onOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = emptyOtpCells()
    for (let i = 0; i < pasted.length; i += 1) {
      next[i] = pasted[i]
    }
    setOtpCells(next)
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    otpRefs.current[focusIndex]?.focus()
  }

  const handleEmailContinue = async (e) => {
    e.preventDefault()
    setError('')
    if (!isValidEmail(email)) return

    setSending(true)
    try {
      await sendOtp(normalizedEmail)
      setOtpCells(emptyOtpCells())
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSending(false)
    }
  }

  const handleOtpVerify = async (e) => {
    e.preventDefault()
    setError('')
    if (otpString.length !== OTP_LENGTH) return

    setVerifying(true)
    try {
      const data = await verifyOtp(normalizedEmail, otpString)
      dispatch(
        login({
          token: data.token,
          email: data.user?.email || normalizedEmail,
        })
      )
      navigate('/organizations', { replace: true })
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setOtpCells(emptyOtpCells())
    setError('')
  }

  const emailReady = isValidEmail(email)

  return (
    <div className="login-page">
      <div className="login-page__blob login-page__blob--1" aria-hidden />
      <div className="login-page__blob login-page__blob--2" aria-hidden />
      <div className="login-page__blob login-page__blob--3" aria-hidden />
      <div className="login-page__grid" aria-hidden />

      <div className="login-page__inner">
        <div className="login-page__center">

          <div className="login-page__card">
            {step === 'email' ? (
              <>
                <h1 className="login-page__title">Welcome</h1>
                <p className="login-page__subtitle">
                  Sign in with your email. New here? We&apos;ll set you up automatically.
                </p>
                <form onSubmit={handleEmailContinue}>
                  <div className="login-page__field-block">
                    <span className="login-page__static-label" id="login-email-label">
                      Enter your email address
                    </span>
                    <div
                      className="login-page__row login-page__row--solo"
                      role="group"
                      aria-labelledby="login-email-label"
                    >
                      <input
                        className="login-page__field"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError('')
                        }}
                        aria-label="Email address"
                      />
                    </div>
                  </div>
                  {error ? <p className="login-page__error">{error}</p> : null}
                  <button
                    type="submit"
                    className="login-page__submit"
                    disabled={!emailReady || sending}
                  >
                    {sending ? 'Sending…' : 'Continue'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="login-page__title">Verify</h1>
                <p className="login-page__subtitle">
                  Enter the 6-digit code we sent to {normalizedEmail}.
                </p>
                <form onSubmit={handleOtpVerify}>
                  <div className="login-page__field-block">
                    <span className="login-page__static-label" id="login-otp-label">
                      Enter OTP
                    </span>
                    <div
                      className="login-page__otp-row"
                      role="group"
                      aria-labelledby="login-otp-label"
                      onPaste={onOtpPaste}
                    >
                      {otpCells.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpRefs.current[index] = el
                          }}
                          className="login-page__otp-box"
                          type="text"
                          inputMode="numeric"
                          autoComplete={index === 0 ? 'one-time-code' : 'off'}
                          maxLength={1}
                          value={digit}
                          onChange={(e) => setOtpAt(index, e.target.value)}
                          onKeyDown={(e) => onOtpKeyDown(index, e)}
                          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                        />
                      ))}
                    </div>
                  </div>
                  {error ? <p className="login-page__error">{error}</p> : null}
                  <button
                    type="submit"
                    className="login-page__submit"
                    disabled={otpString.length !== OTP_LENGTH || verifying}
                  >
                    {verifying ? 'Verifying…' : 'Verify'}
                  </button>
                  <button
                    type="button"
                    className="login-page__back"
                    onClick={handleBackToEmail}
                  >
                    Change email
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="login-page__legal-wrap">
          <p className="login-page__legal">
            By continuing, you agree to our{' '}
            <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
