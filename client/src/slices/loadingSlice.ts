import { createSlice } from '@reduxjs/toolkit'

const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
      isLoading: false,
      message: ''
  },
  reducers: {
    setLoading(state, action) {
        state = action.payload
    }
  }
})

export const { setLoading } = loadingSlice.actions

export default loadingSlice.reducer
