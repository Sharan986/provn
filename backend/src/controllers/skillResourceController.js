const pool = require('../db/pool');

/**
 * GET /api/skills/:skillId/resources
 * Returns all curated resource links for a skill.
 */
async function getSkillResources(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, url, type, source, thumbnail, duration, order_index
       FROM skill_resource_links
       WHERE skill_id = $1
       ORDER BY order_index ASC, created_at ASC`,
      [req.params.skillId]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getSkillResources error:', err);
    return res.status(500).json({ error: 'Failed to fetch resources' });
  }
}

/**
 * POST /api/skills/:skillId/resources
 * Admin only: Add a curated resource link.
 * Body: { title, url, type, source, thumbnail, duration, orderIndex }
 */
async function createSkillResource(req, res) {
  const { title, url, type, source, thumbnail, duration, orderIndex } = req.body;
  const skillId = req.params.skillId;

  if (!title || !url) {
    return res.status(400).json({ error: 'title and url are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO skill_resource_links (skill_id, title, url, type, source, thumbnail, duration, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [skillId, title, url, type || 'video', source || null, thumbnail || null, duration || null, orderIndex ?? 0]
    );
    return res.status(201).json({ success: true, data: { id: rows[0].id } });
  } catch (err) {
    console.error('createSkillResource error:', err);
    return res.status(500).json({ error: 'Failed to create resource' });
  }
}

/**
 * PUT /api/skills/resources/:id
 * Admin only: Update a resource link.
 */
async function updateSkillResource(req, res) {
  const { title, url, type, source, thumbnail, duration, orderIndex } = req.body;

  try {
    const sets = [];
    const params = [];
    let idx = 1;

    if (title !== undefined)      { sets.push(`title = $${idx++}`);       params.push(title); }
    if (url !== undefined)        { sets.push(`url = $${idx++}`);         params.push(url); }
    if (type !== undefined)       { sets.push(`type = $${idx++}`);        params.push(type); }
    if (source !== undefined)     { sets.push(`source = $${idx++}`);      params.push(source); }
    if (thumbnail !== undefined)  { sets.push(`thumbnail = $${idx++}`);   params.push(thumbnail); }
    if (duration !== undefined)   { sets.push(`duration = $${idx++}`);    params.push(duration); }
    if (orderIndex !== undefined) { sets.push(`order_index = $${idx++}`); params.push(orderIndex); }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);
    const { rowCount } = await pool.query(
      `UPDATE skill_resource_links SET ${sets.join(', ')} WHERE id = $${idx}`,
      params
    );

    if (!rowCount) return res.status(404).json({ error: 'Resource not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('updateSkillResource error:', err);
    return res.status(500).json({ error: 'Failed to update resource' });
  }
}

/**
 * DELETE /api/skills/resources/:id
 * Admin only: Remove a resource link.
 */
async function deleteSkillResource(req, res) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM skill_resource_links WHERE id = $1',
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Resource not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteSkillResource error:', err);
    return res.status(500).json({ error: 'Failed to delete resource' });
  }
}

module.exports = {
  getSkillResources,
  createSkillResource,
  updateSkillResource,
  deleteSkillResource,
};
