import { List, Rate, Typography } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store'
import { setRating } from '../store/ratingsSlice'

const films = [
  { id: 1, title: 'Касабланка', year: 1942 },
  { id: 2, title: 'Римские каникулы', year: 1953 },
  { id: 3, title: 'Головокружение', year: 1958 },
]

export default function Catalog() {
  const dispatch = useDispatch<AppDispatch>()
  const ratings = useSelector((state: RootState) => state.ratings)

  return (
    <div>
      <Typography.Title level={2}>Каталог</Typography.Title>
      <List
        dataSource={films}
        renderItem={(film) => (
          <List.Item>
            <span>
              {film.title} ({film.year})
            </span>
            <Rate
              count={10}
              value={ratings[film.id] ?? 0}
              onChange={(value) => dispatch(setRating({ filmId: film.id, value }))}
            />
          </List.Item>
        )}
      />
    </div>
  )
}
