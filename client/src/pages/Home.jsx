import React, { useState, useEffect } from 'react'

import { Loader, Card, FormField } from '../components'

const RenderCards = ({ data, title }) => {
  if (data?.length > 0) {
    return data.map(post => <Card key={post._id} {...post} />)
  }

  return (
    <h2 className="mt-5 font-bold text-[#6449ff] text-xl uppercase">{title}</h2>
  )
}

const Home = () => {
  const [loading, setLoading] = useState(false)
  const [allPosts, setAllPosts] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [searchedResults, setSearchedResults] = useState(null)
  const [searchTimeout, setSearchTimeout] = useState(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)

      try {
        const response = await fetch('http://localhost:8080/api/v1/post', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const result = await response.json()

          setAllPosts(result.data.reverse())
        }
      } catch (error) {
        alert(error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleSearchChange = e => {
    clearTimeout(searchTimeout)
    setSearchText(e.target.value)

    setSearchTimeout(
      setTimeout(() => {
        const searchResult = allPosts.filter(
          item =>
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.prompt.toLowerCase().includes(searchText.toLowerCase())
        )
        setSearchedResults(searchResult)
      }, 500)
    )
  }

  return (
    <section className="max-w-7xl mx-auto">
      <div>
        <h1 className="font-extrabold text-[#222328] text-[32px]">
          大家的分享
        </h1>
        <p className="mt-2 text-[#666e75] text-[16px] max-w[500px]">
          浏览其他人通过DALL-E AI生成的充满想象力和视觉冲击力的图片
        </p>
      </div>

      <div className="mt-16">
        <FormField
          labelName="搜索其他人的发布"
          type="text"
          name="text"
          placeholder=""
          value={searchText}
          handleChange={handleSearchChange}
        />
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <>
            {searchText && (
              <h2 className="font-medium text-[#666e75] text-xl mb-3">
                展示 <span className="text-[#222328]">{searchText}</span>{' '}
                的搜索结果
              </h2>
            )}
            <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-3">
              {searchText ? (
                <RenderCards data={searchedResults} title="无" />
              ) : (
                <RenderCards data={allPosts} title="无" />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
export default Home
