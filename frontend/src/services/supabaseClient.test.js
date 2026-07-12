import { expect, test } from 'vitest'
import { supabase } from './supabaseClient'

test('Supabase client is configured with correct project URL', () => {
  expect(supabase.supabaseUrl).toBe('https://famuonvjmgakdumlmujk.supabase.co')
})
