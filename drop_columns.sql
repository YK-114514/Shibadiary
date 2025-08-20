-- 删除post_infom表中的avatar和name列
ALTER TABLE post_infom DROP COLUMN IF EXISTS avatar;
ALTER TABLE post_infom DROP COLUMN IF EXISTS name;

-- 查看修改后的表结构
DESCRIBE post_infom; 