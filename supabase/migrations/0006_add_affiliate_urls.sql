-- Add affiliate URL columns to tips_corpus
ALTER TABLE tips_corpus ADD COLUMN IF NOT EXISTS affiliate_url_amazon TEXT DEFAULT NULL;
ALTER TABLE tips_corpus ADD COLUMN IF NOT EXISTS affiliate_url_audible TEXT DEFAULT NULL;

-- Populate Amazon affiliate URLs for book sources (kinloop-20 tag)
UPDATE tips_corpus SET affiliate_url_amazon = CASE
  WHEN source LIKE '%No-Drama Discipline%' THEN 'https://www.amazon.com/s?k=No-Drama+Discipline+Daniel+Siegel&tag=kinloop-20'
  WHEN source LIKE '%Raising An Emotionally%' THEN 'https://www.amazon.com/s?k=Raising+Emotionally+Intelligent+Child+Gottman&tag=kinloop-20'
  WHEN source LIKE '%Sleep Lady%' THEN 'https://www.amazon.com/s?k=Sleep+Lady+Good+Night+Sleep+Tight+Kim+West&tag=kinloop-20'
  WHEN source LIKE '%Power of Play%' THEN 'https://www.amazon.com/s?k=Power+of+Play+David+Elkind&tag=kinloop-20'
  WHEN source LIKE '%French Kids%' THEN 'https://www.amazon.com/s?k=French+Kids+Eat+Everything+Karen+Le+Billon&tag=kinloop-20'
  WHEN source LIKE '%How to Talk So Kids%' THEN 'https://www.amazon.com/s?k=How+to+Talk+So+Kids+Will+Listen+Faber+Mazlish&tag=kinloop-20'
  WHEN source LIKE '%Precious Little Sleep%' THEN 'https://www.amazon.com/s?k=Precious+Little+Sleep+Alexis+Dubief&tag=kinloop-20'
  WHEN source LIKE '%Attachment Parenting%' THEN 'https://www.amazon.com/s?k=Attachment+Parenting+Book+William+Sears&tag=kinloop-20'
  WHEN source LIKE '%Thirty Million Words%' THEN 'https://www.amazon.com/s?k=Thirty+Million+Words+Dana+Suskind&tag=kinloop-20'
  WHEN source LIKE '%Caring for Your Baby%' THEN 'https://www.amazon.com/s?k=Caring+Baby+Young+Child+AAP&tag=kinloop-20'
  WHEN source LIKE '%Baby-Led Weaning%' THEN 'https://www.amazon.com/s?k=Baby-Led+Weaning+Gill+Rapley&tag=kinloop-20'
  WHEN source LIKE '%Whole-Brain Child%' THEN 'https://www.amazon.com/s?k=Whole-Brain+Child+Daniel+Siegel&tag=kinloop-20'
  WHEN source LIKE '%Child of Mine%' THEN 'https://www.amazon.com/s?k=Child+of+Mine+Ellyn+Satter&tag=kinloop-20'
  WHEN source LIKE '%Healthy Sleep Habits%' THEN 'https://www.amazon.com/s?k=Healthy+Sleep+Habits+Happy+Child+Weissbluth&tag=kinloop-20'
  ELSE affiliate_url_amazon
END
WHERE source LIKE '%by %' OR source LIKE '%AAP%';

-- Populate Audible affiliate URLs for popular audiobook titles
UPDATE tips_corpus SET affiliate_url_audible = CASE
  WHEN source LIKE '%No-Drama Discipline%' THEN 'https://www.audible.com/search?keywords=No-Drama+Discipline+Siegel&tag=kinloop-20'
  WHEN source LIKE '%How to Talk So Kids%' THEN 'https://www.audible.com/search?keywords=How+to+Talk+So+Kids+Will+Listen+Faber&tag=kinloop-20'
  WHEN source LIKE '%Whole-Brain Child%' THEN 'https://www.audible.com/search?keywords=Whole-Brain+Child+Siegel&tag=kinloop-20'
  WHEN source LIKE '%Raising An Emotionally%' THEN 'https://www.audible.com/search?keywords=Raising+Emotionally+Intelligent+Child+Gottman&tag=kinloop-20'
  WHEN source LIKE '%Healthy Sleep Habits%' THEN 'https://www.audible.com/search?keywords=Healthy+Sleep+Habits+Happy+Child+Weissbluth&tag=kinloop-20'
  WHEN source LIKE '%Thirty Million Words%' THEN 'https://www.audible.com/search?keywords=Thirty+Million+Words+Suskind&tag=kinloop-20'
  WHEN source LIKE '%Precious Little Sleep%' THEN 'https://www.audible.com/search?keywords=Precious+Little+Sleep+Dubief&tag=kinloop-20'
  ELSE affiliate_url_audible
END
WHERE source LIKE '%by %';
