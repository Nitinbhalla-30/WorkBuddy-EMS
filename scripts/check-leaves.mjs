import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envContent = readFileSync(join(__dirname, '..', '.env'), 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) envVars[key.trim()] = rest.join('=').trim()
})

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY)

const LEAVE_TYPES = ['casual', 'sick', 'earned', 'halfday', 'short']

async function main() {
  // Fetch all approved leaves
  const { data: allLeaves, error } = await supabase
    .from('leaves')
    .select('id, type')
    .eq('status', 'approved')
    .order('id')

  if (error) { console.error('Error:', error); return }
  console.log('Total approved leaves:', allLeaves.length)

  // Current distribution
  const currentCounts = {}
  for (const l of allLeaves) currentCounts[l.type] = (currentCounts[l.type] || 0) + 1
  console.log('Current distribution:', JSON.stringify(currentCounts))

  // Target: equal distribution
  const total = allLeaves.length
  const basePerType = Math.floor(total / LEAVE_TYPES.length)
  const remainder = total % LEAVE_TYPES.length

  const targetCounts = {}
  LEAVE_TYPES.forEach((t, i) => {
    targetCounts[t] = basePerType + (i < remainder ? 1 : 0)
  })
  console.log('Target distribution:', JSON.stringify(targetCounts))

  // Build reassignment plan using round-robin on sorted IDs
  // Sort leaves by ID to ensure deterministic assignment
  const sorted = [...allLeaves].sort((a, b) => a.id - b.id)
  const updates = []

  for (let i = 0; i < sorted.length; i++) {
    const newType = LEAVE_TYPES[i % LEAVE_TYPES.length]
    if (sorted[i].type !== newType) {
      updates.push({ id: sorted[i].id, type: newType })
    }
  }

  console.log(`\nNeed to update ${updates.length} records`)

  // Batch update in groups of 100
  const batchSize = 100
  let updated = 0
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    for (const u of batch) {
      const { error: updateError } = await supabase
        .from('leaves')
        .update({ type: u.type })
        .eq('id', u.id)

      if (updateError) {
        console.error('Update error for id', u.id, ':', updateError)
        return
      }
    }
    updated += batch.length
    console.log(`Updated ${updated}/${updates.length}`)
  }

  // Verify new distribution
  const { data: verifyLeaves } = await supabase
    .from('leaves')
    .select('type')
    .eq('status', 'approved')

  const newCounts = {}
  for (const l of (verifyLeaves || [])) newCounts[l.type] = (newCounts[l.type] || 0) + 1
  console.log('\nNew distribution:', JSON.stringify(newCounts))

  // Check today's distribution
  const { data: todayLeaves } = await supabase
    .from('leaves')
    .select('id, employee_id, type')
    .eq('status', 'approved')
    .eq('from_date', '2026-08-27')

  const todayCounts = {}
  for (const l of (todayLeaves || [])) todayCounts[l.type] = (todayCounts[l.type] || 0) + 1
  console.log('Today (Aug 27) distribution:', JSON.stringify(todayCounts))
  console.log('Today total:', (todayLeaves || []).length)
}

main()
