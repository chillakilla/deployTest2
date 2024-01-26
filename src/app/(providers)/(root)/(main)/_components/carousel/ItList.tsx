'use client';
import {getPosts} from '@/app/api/firebaseApi';
import {Post} from '@/app/api/typePost';
import {db} from '@/firebase';
import {useQuery} from '@tanstack/react-query';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import Link from 'next/link';
import {useRef, useState} from 'react';
import {FaCalendarAlt, FaRegHeart} from 'react-icons/fa';
import {IoPeopleSharp} from 'react-icons/io5';
import {Swiper, SwiperSlide} from 'swiper/react';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import SwiperCore from 'swiper';
import {Navigation, Pagination} from 'swiper/modules';

export default function ItList() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const updateViewsCount = async (postId: string) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const postSnapshot = await getDoc(postRef);

      if (postSnapshot.exists()) {
        const currentViews = postSnapshot.data().views || 0;
        await updateDoc(postRef, {
          views: currentViews + 1, // 'views' 카운트 증가
        });
      } else {
        console.error(`게시물 ID ${postId}에 해당하는 문서가 존재하지 않습니다.`);
      }
    } catch (error) {
      console.error('Views 카운트 업데이트 중 오류:', error);
    }
  };
  // 게시물 클릭을 처리하는 함수
  const clickPostHandler = (post: Post) => {
    setSelectedPost(post);
    updateViewsCount(post.id); // 'views' 카운트를 업데이트하는 함수 호출
  };
  SwiperCore.use([Navigation, Pagination]);
  const swiperRef = useRef<SwiperCore>();
  const {
    data: posts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (isError) {
    return <div>로딩 중에 오류가 발생했습니다.</div>;
  }

  if (!posts) {
    return <div>불러올 수 있는 게시글이 없습니다.</div>;
  }

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">
          요즘 <span className="text-[#0051FF]">IT</span> Surv
        </h2>
        <Link href={`/survey-it`} className="text-lg font-semibold text-[#0051FF]">
          더보기
        </Link>
      </div>
      <Swiper
        onSwiper={swiper => {
          swiperRef.current = swiper;
        }}
        slidesPerView={4}
        spaceBetween={20}
        loop={true}
        pagination={{
          clickable: true,
          el: null,
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className="popular-swiper"
      >
        {posts.map(post => {
          return (
            <SwiperSlide id="it-slide" key={post.id}>
              <Link href={`/survey-it/${post.id}`}>
                <div
                  className="h-64 border-2 border-[#e1e1e1] flex flex-col justify-between rounded-xl p-4 bg-white"
                  onClick={() => clickPostHandler(post)}
                >
                  <div className="category-box flex justify-between items-center mb-4">
                    <div className="bg-[#0051FF] text-[#D6FF00] w-14 p-1 text-center rounded-full font-semibold text-xs">
                      {post.category}
                    </div>
                    <button className="like-button w-[20px] h-[20px] flex justify-evenly items-center text-[#0051FF] bg-transparent">
                      <FaRegHeart />
                    </button>
                  </div>
                  <h3 className="font-semibold text-lg text-ellipsis overflow-hidden h-[56px]">{post.title}</h3>
                  <div className="survey-method flex flex-col gap-2 bg-slate-100 h-[70px] p-2  ">
                    <div className="flex text-sm justify-start grid grid-cols-2 ">
                      <p>
                        <span className="text-[#666]">소요 시간</span> &nbsp; {post.researchTime}
                      </p>
                      <p>
                        <span className="text-[#666]">설문 방식</span> &nbsp; {post.researchType}
                      </p>
                    </div>
                    <div className="survey-method flex text-sm justify-start grid grid-cols-2">
                      <p>
                        <span className="text-[#666]">참여 연령</span> &nbsp; {post.ageGroup}
                      </p>
                      <p>
                        <span className="text-[#666]">참여 대상</span> &nbsp; {post.sexType}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 border-t-1 border-[#eee] flex  items-center">
                    <div className="flex items-center mt-4 justify-between w-full">
                      <p className="flex items-center gap-2 text-sm text-[#666]">
                        <FaCalendarAlt /> <span className="text-[#0051FF]"></span>
                      </p>
                      <div className="viewer flex  gap-2 text-[#818490]">
                        <IoPeopleSharp />
                        {post.views}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </>
  );
}
