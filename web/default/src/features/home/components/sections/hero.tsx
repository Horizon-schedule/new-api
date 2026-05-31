/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { HeroTerminalDemo } from '../hero-terminal-demo'
import { HeroModelShowcase } from '../hero-model-showcase'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()

  return (
    <section className='relative z-10 flex flex-col items-center overflow-x-clip px-6 pt-28 pb-16 md:pt-36 md:pb-24'>
      {/* 轻量网格纹理（底色由 .home-landing 提供） */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black_20%,transparent_100%)] bg-[size:4rem_4rem] opacity-[0.06] dark:opacity-[0.08]'
      />

      <div className='flex max-w-3xl flex-col items-center text-center'>
        <h1
          className='landing-animate-fade-up text-[clamp(2rem,5.5vw,3.5rem)] leading-[1.15] font-bold tracking-tight'
          style={{ animationDelay: '0ms' }}
        >
          {t('Unified API Gateway for')}
          <br />
          <span className='text-preset-highlight'>
            {t('All Your AI Models')}
          </span>
        </h1>
        <p
          className='landing-animate-fade-up text-muted-foreground/80 mt-5 max-w-lg text-base leading-relaxed opacity-0 md:text-lg'
          style={{ animationDelay: '80ms' }}
        >
          {t('Power AI applications, manage digital assets, connect the Future')}
        </p>
        <div
          className='landing-animate-fade-up mt-8 flex items-center gap-3 opacity-0'
          style={{ animationDelay: '160ms' }}
        >
          {props.isAuthenticated ? (
            <Button
              className='group rounded-lg'
              render={<Link to='/dashboard' />}
            >
              {t('Go to Dashboard')}
              <ArrowRight className='ml-1 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
            </Button>
          ) : (
            <>
              <Button
                className='group rounded-lg'
                render={<Link to='/sign-up' />}
              >
                {t('Get Started')}
                <ArrowRight className='ml-1 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
              </Button>
              <Button
                variant='outline'
                className='border-border/50 hover:border-border hover:bg-muted/50 rounded-lg'
                render={<Link to='/pricing' />}
              >
                {t('View Pricing')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* AI providers & popular models */}
      <div
        className='landing-animate-fade-up mt-12 w-full opacity-0'
        style={{ animationDelay: '240ms' }}
      >
        <HeroModelShowcase />
      </div>

      <div
        className='landing-animate-fade-up w-full opacity-0'
        style={{ animationDelay: '300ms' }}
      >
        <HeroTerminalDemo />
      </div>
    </section>
  )
}
