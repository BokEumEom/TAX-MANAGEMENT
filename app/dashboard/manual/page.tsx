"use client"

import { useState } from "react"

export default function ManualPage() {
  const [activeSection, setActiveSection] = useState("getting-started")

  const sections = [
    { id: "getting-started", title: "처음 시작하기", icon: "🚀" },
    { id: "login-guide", title: "로그인 가이드", icon: "🔐" },
    { id: "dashboard-overview", title: "대시보드 둘러보기", icon: "📊" },
    { id: "tax-management", title: "세금 관리하기", icon: "💰" },
    { id: "station-management", title: "충전소 관리하기", icon: "⚡" },
    { id: "calendar-usage", title: "캘린더 사용하기", icon: "📅" },
    { id: "notification-system", title: "알림 시스템", icon: "🔔" },
    { id: "search-function", title: "검색 기능", icon: "🔍" },
    { id: "user-roles", title: "사용자 권한", icon: "👥" },
    { id: "troubleshooting", title: "문제 해결", icon: "🛠️" },
  ]

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">📚 세무 관리 시스템 완전 가이드</h1>
          <p className="text-xl text-gray-400">처음 사용하시는 분도 쉽게 따라할 수 있는 단계별 사용설명서</p>
        </div>

        <div className="flex gap-8">
          {/* 사이드바 네비게이션 */}
          <div className="w-80 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 h-fit sticky top-6">
            <h2 className="text-lg font-semibold text-white mb-4">목차</h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <span className="text-lg mr-3">{section.icon}</span>
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            {/* 처음 시작하기 */}
            {activeSection === "getting-started" && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">🚀 처음 시작하기</h2>

                <div className="space-y-8">
                  <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">환영합니다! 👋</h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      세무 관리 시스템은 충전소 운영자들이 복잡한 세무 업무를 쉽고 체계적으로 관리할 수 있도록 도와주는
                      프로그램입니다. 이 가이드를 따라하시면 누구나 쉽게 사용할 수 있습니다.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-700/30 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-white mb-3">🎯 주요 기능</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li>• 세금 납부 일정 관리</li>
                        <li>• 충전소별 세무 현황 추적</li>
                        <li>• 자동 이메일 알림</li>
                        <li>• OCR 문서 인식</li>
                        <li>• 캘린더 일정 관리</li>
                      </ul>
                    </div>
                    <div className="bg-gray-700/30 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-white mb-3">⏱️ 시작 전 준비사항</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li>• 인터넷 연결 확인</li>
                        <li>• 충전소 기본 정보 준비</li>
                        <li>• 세금 관련 서류 준비</li>
                        <li>• 이메일 주소 확인</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-700 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-green-400 mb-4">📋 첫 사용 체크리스트</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                          1
                        </div>
                        <span className="text-gray-300">계정 로그인하기</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                          2
                        </div>
                        <span className="text-gray-300">첫 번째 충전소 등록하기</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                          3
                        </div>
                        <span className="text-gray-300">첫 번째 세금 등록하기</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                          4
                        </div>
                        <span className="text-gray-300">캘린더에서 일정 확인하기</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 로그인 가이드 */}
            {activeSection === "login-guide" && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">🔐 로그인 가이드</h2>

                <div className="space-y-8">
                  <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">로그인 방법</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">웹사이트 접속</h4>
                          <p className="text-gray-300">브라우저에서 세무 관리 시스템 주소로 접속합니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">이메일과 비밀번호 입력</h4>
                          <p className="text-gray-300">등록된 이메일 주소와 비밀번호를 정확히 입력합니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">로그인 버튼 클릭</h4>
                          <p className="text-gray-300">정보 입력 후 "로그인" 버튼을 클릭하면 대시보드로 이동합니다.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">⚠️ 로그인 문제 해결</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-white">비밀번호를 잊어버렸을 때</h4>
                        <p className="text-gray-300">로그인 페이지에서 "비밀번호 찾기" 링크를 클릭하여 재설정하세요.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">계정이 없을 때</h4>
                        <p className="text-gray-300">관리자에게 계정 생성을 요청하거나 회원가입 페이지를 이용하세요.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">로그인이 안될 때</h4>
                        <p className="text-gray-300">
                          이메일 주소와 비밀번호를 다시 확인하고, 대소문자를 정확히 입력하세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 대시보드 둘러보기 */}
            {activeSection === "dashboard-overview" && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">📊 대시보드 둘러보기</h2>

                <div className="space-y-8">
                  <div className="bg-green-900/20 border border-green-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-400 mb-4">대시보드란?</h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      대시보드는 세무 현황을 한눈에 파악할 수 있는 메인 화면입니다. 로그인하면 가장 먼저 보이는
                      화면으로, 중요한 정보들이 요약되어 표시됩니다.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-700/30 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">📈 통계 카드</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li>
                          • <strong>총 세금:</strong> 등록된 전체 세금 건수
                        </li>
                        <li>
                          • <strong>임박한 납부:</strong> 7일 이내 납부할 세금
                        </li>
                        <li>
                          • <strong>연체:</strong> 납부 기한이 지난 세금
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-700/30 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        📅 다가오는 일정
                      </h4>
                      <ul className="space-y-2 text-gray-300">
                        <li>• 가장 가까운 납부 일정 표시</li>
                        <li>• 충전소별 세금 정보</li>
                        <li>• 납부 금액과 기한 확인</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">🧭 화면 구성 요소</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="bg-gray-600 p-4 rounded-lg mb-3">
                          <h5 className="font-semibold text-white">상단 헤더</h5>
                        </div>
                        <p className="text-sm text-gray-300">로고, 검색, 권한 설정</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-gray-600 p-4 rounded-lg mb-3">
                          <h5 className="font-semibold text-white">왼쪽 사이드바</h5>
                        </div>
                        <p className="text-sm text-gray-300">메뉴 네비게이션</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-gray-600 p-4 rounded-lg mb-3">
                          <h5 className="font-semibold text-white">메인 콘텐츠</h5>
                        </div>
                        <p className="text-sm text-gray-300">통계, 일정, 목록</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 세금 관리하기 */}
            {activeSection === "tax-management" && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">💰 세금 관리하기</h2>

                <div className="space-y-8">
                  <div className="bg-orange-900/20 border border-orange-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-orange-400 mb-4">세금 등록 방법</h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">📝 수동 입력 방법</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              1
                            </div>
                            <div>
                              <p className="text-gray-300">사이드바에서 "세금 등록" 클릭</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              2
                            </div>
                            <div>
                              <p className="text-gray-300">충전소 선택 (드롭다운에서 선택)</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              3
                            </div>
                            <div>
                              <p className="text-gray-300">세금 유형 선택 (부가가치세, 취득세 등)</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              4
                            </div>
                            <div>
                              <p className="text-gray-300">납부 금액 입력 (숫자만 입력)</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              5
                            </div>
                            <div>
                              <p className="text-gray-300">납부 기한 선택 (캘린더에서 날짜 선택)</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              6
                            </div>
                            <div>
                              <p className="text-gray-300">"세금 등록" 버튼 클릭하여 저장</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">📷 OCR 자동 인식 방법</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              1
                            </div>
                            <div>
                              <p className="text-gray-300">세금계산서나 영수증을 스마트폰으로 촬영</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              2
                            </div>
                            <div>
                              <p className="text-gray-300">"문서 업로드" 버튼 클릭</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              3
                            </div>
                            <div>
                              <p className="text-gray-300">이미지 파일 선택 (JPG, PNG 지원)</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              4
                            </div>
                            <div>
                              <p className="text-gray-300">자동으로 인식된 정보 확인 및 수정</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                              5
                            </div>
                            <div>
                              <p className="text-gray-300">정보 확인 후 저장</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">세금 목록 관리</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">📋 목록 보기</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 등록된 모든 세금 확인</li>
                          <li>• 충전소별, 상태별 필터링</li>
                          <li>• 납부 기한 순 정렬</li>
                          <li>• 검색 기능 활용</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">⚡ 빠른 작업</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 납부 완료 처리</li>
                          <li>• 이메일 알림 전송</li>
                          <li>• 세금 정보 수정</li>
                          <li>• 일괄 처리 기능</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-400 mb-4">💡 세금 관리 팁</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>
                        • <strong>정기적인 확인:</strong> 주 1회 이상 세금 목록을 확인하세요
                      </li>
                      <li>
                        • <strong>미리 알림:</strong> 납부 기한 3-5일 전에 이메일 알림을 설정하세요
                      </li>
                      <li>
                        • <strong>문서 보관:</strong> OCR로 인식한 원본 이미지도 따로 보관하세요
                      </li>
                      <li>
                        • <strong>상태 관리:</strong> 납부 완료 후 즉시 상태를 업데이트하세요
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 충전소 관리하기 */}
            {activeSection === "station-management" && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">⚡ 충전소 관리하기</h2>

                <div className="space-y-8">
                  <div className="bg-purple-900/20 border border-purple-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-purple-400 mb-4">충전소 등록하기</h3>
                    <p className="text-gray-300 mb-4">
                      세금을 등록하기 전에 먼저 충전소 정보를 등록해야 합니다. 충전소는 세금 관리의 기본 단위가 됩니다.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">충전소 등록 페이지 이동</h4>
                          <p className="text-gray-300">사이드바에서 "충전소 등록" 버튼을 클릭합니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">기본 정보 입력</h4>
                          <ul className="text-gray-300 mt-2 space-y-1">
                            <li>
                              • <strong>충전소명:</strong> 예) 강남역 1호점, 서울시청 충전소
                            </li>
                            <li>
                              • <strong>위치:</strong> 상세 주소 또는 간단한 위치 설명
                            </li>
                            <li>
                              • <strong>운영 상태:</strong> 운영중, 점검중, 중단 중 선택
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">정보 저장</h4>
                          <p className="text-gray-300">"충전소 등록" 버튼을 클릭하여 정보를 저장합니다.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">충전소 목록 관리</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">📊 현황 확인</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 총 충전소 수</li>
                          <li>• 운영 상태별 통계</li>
                          <li>• 점검 중인 충전소</li>
                          <li>• 등록일 및 수정일</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">🔧 관리 기능</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 충전소 정보 수정</li>
                          <li>• 운영 상태 변경</li>
                          <li>• 충전소별 세금 내역 확인</li>
                          <li>• 충전소 삭제 (주의 필요)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">⚠️ 충전소 관리 주의사항</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-white">충전소 삭제 시</h4>
                        <p className="text-gray-300">
                          충전소를 삭제하면 해당 충전소에 등록된 모든 세금 정보도 함께 삭제됩니다. 삭제 전에 반드시 관련
                          세금 정보를 확인하세요.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">운영 상태 관리</h4>
                        <p className="text-gray-300">
                          점검이나 중단 상태의 충전소도 세금 납부 의무는 계속됩니다. 상태 변경이 세금 관리에 영향을 주지
                          않도록 주의하세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 캘린더 사용하기 */}
            {activeSection === "calendar-usage" && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">📅 캘린더 사용하기</h2>

                <div className="space-y-8">
                  <div className="bg-green-900/20 border border-green-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-400 mb-4">캘린더 기능 소개</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-4">
                      캘린더는 세금 납부 일정을 시각적으로 확인할 수 있는 가장 직관적인 도구입니다. 월별로 모든 납부
                      일정을 한눈에 파악하고 관리할 수 있습니다.
                    </p>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-green-800/30 p-4 rounded-lg text-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                        <h4 className="font-semibold text-white">납부 완료</h4>
                        <p className="text-sm text-gray-300">초록색 표시</p>
                      </div>
                      <div className="bg-orange-800/30 p-4 rounded-lg text-center">
                        <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-2"></div>
                        <h4 className="font-semibold text-white">납부 예정</h4>
                        <p className="text-sm text-gray-300">주황색 표시</p>
                      </div>
                      <div className="bg-red-800/30 p-4 rounded-lg text-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                        <h4 className="font-semibold text-white">연체</h4>
                        <p className="text-sm text-gray-300">빨간색 표시</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">캘린더 사용 방법</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">캘린더 접근</h4>
                          <p className="text-gray-300">사이드바에서 "일정 캘린더" 메뉴를 클릭합니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">월 이동</h4>
                          <p className="text-gray-300">상단의 ← → 버튼으로 이전/다음 달로 이동할 수 있습니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">일정 확인</h4>
                          <p className="text-gray-300">각 날짜의 색상 점으로 세금 납부 상태를 확인합니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          4
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">상세 정보</h4>
                          <p className="text-gray-300">
                            하단의 "다가오는 납부 일정" 목록에서 자세한 정보를 확인합니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-900/20 border border-purple-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-purple-400 mb-4">특별 표시</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">🔴 주말 및 공휴일</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 토요일, 일요일: 빨간색 날짜</li>
                          <li>• 한국 공휴일: 빨간색 날짜</li>
                          <li>• 신정, 설날, 추석 등 포함</li>
                          <li>• 어린이날, 현충일 등 포함</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">📋 일정 목록</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 다가오는 7일간의 일정</li>
                          <li>• 충전소명과 세금 유형</li>
                          <li>• 납부 금액과 상태</li>
                          <li>• 긴급도별 색상 구분</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">💡 캘린더 활용 팁</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>
                        • <strong>매일 확인:</strong> 아침에 캘린더를 확인하여 당일 납부할 세금이 있는지 체크하세요
                      </li>
                      <li>
                        • <strong>주간 계획:</strong> 매주 초에 다음 주 일정을 미리 확인하세요
                      </li>
                      <li>
                        • <strong>월말 정리:</strong> 매월 말에 다음 달 전체 일정을 검토하세요
                      </li>
                      <li>
                        • <strong>공휴일 주의:</strong> 공휴일 전후로 은행 업무 시간을 확인하세요
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 알림 시스템 */}
            {activeSection === "notification-system" && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">🔔 알림 시스템</h2>

                <div className="space-y-8">
                  <div className="bg-red-900/20 border border-red-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-red-400 mb-4">이메일 알림 기능</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-4">
                      세금 납부 기한을 놓치지 않도록 이메일로 자동 알림을 받을 수 있습니다. 개별 알림과 일괄 알림 두
                      가지 방식을 지원합니다.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-red-800/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-3">📧 개별 알림</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 특정 세금에 대한 개별 알림</li>
                          <li>• 세금 목록에서 "알림 전송" 클릭</li>
                          <li>• 즉시 이메일 발송</li>
                          <li>• 알림 기록 자동 저장</li>
                        </ul>
                      </div>
                      <div className="bg-red-800/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-3">📬 일괄 알림</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 연체된 모든 세금 일괄 알림</li>
                          <li>• 알림 관리 페이지에서 설정</li>
                          <li>• 한 번에 여러 알림 전송</li>
                          <li>• 효율적인 대량 알림 처리</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">알림 설정 방법</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">🔧 수동 알림 설정</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              1
                            </div>
                            <div>
                              <p className="text-gray-300">사이드바에서 "알림 등록" 클릭</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              2
                            </div>
                            <div>
                              <p className="text-gray-300">알림 제목과 내용 작성</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              3
                            </div>
                            <div>
                              <p className="text-gray-300">관련 세금 선택 (선택사항)</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              4
                            </div>
                            <div>
                              <p className="text-gray-300">알림 일시 설정</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              5
                            </div>
                            <div>
                              <p className="text-gray-300">"알림 등록" 버튼으로 저장</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">⚡ 자동 알림 생성</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              1
                            </div>
                            <div>
                              <p className="text-gray-300">알림 목록 페이지에서 "자동 알림 생성" 클릭</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              2
                            </div>
                            <div>
                              <p className="text-gray-300">미납 세금 목록 확인</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              3
                            </div>
                            <div>
                              <p className="text-gray-300">"일괄 알림 생성" 버튼으로 자동 생성</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-400 mb-4">이메일 내용</h3>
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">📧 알림 이메일 포함 정보</h4>
                      <ul className="space-y-1 text-gray-300">
                        <li>• 세금 유형 (부가가치세, 취득세 등)</li>
                        <li>• 충전소명</li>
                        <li>• 납부 금액</li>
                        <li>• 납부 기한</li>
                        <li>• 세무 관리 시스템 바로가기 링크</li>
                        <li>• 연체 시 긴급 표시</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">⚠️ 알림 시스템 주의사항</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-white">이메일 설정 필요</h4>
                        <p className="text-gray-300">
                          이메일 알림 기능을 사용하려면 관리자가 SendGrid API를 설정해야 합니다. 이메일이 발송되지
                          않으면 관리자에게 문의하세요.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">스팸 메일함 확인</h4>
                        <p className="text-gray-300">
                          알림 이메일이 스팸 메일함으로 분류될 수 있습니다. 알림이 오지 않으면 스팸 메일함을
                          확인해보세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 검색 기능 */}
            {activeSection === "search-function" && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">🔍 검색 기능</h2>

                <div className="space-y-8">
                  <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">검색 기능 소개</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-4">
                      상단 헤더의 검색창을 통해 세금과 충전소 정보를 빠르게 찾을 수 있습니다. 키워드 하나로 관련된 모든
                      정보를 검색할 수 있어 매우 편리합니다.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-800/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-3">💰 세금 검색</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 세금 유형으로 검색</li>
                          <li>• 충전소명으로 검색</li>
                          <li>• 납부 금액으로 검색</li>
                          <li>• 부분 일치도 지원</li>
                        </ul>
                      </div>
                      <div className="bg-blue-800/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-3">⚡ 충전소 검색</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 충전소명으로 검색</li>
                          <li>• 위치 정보로 검색</li>
                          <li>• 운영 상태별 검색</li>
                          <li>• 키워드 부분 일치</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-400 mb-4">검색 사용 방법</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">검색창 클릭</h4>
                          <p className="text-gray-300">상단 헤더의 "검색..." 입력창을 클릭합니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">키워드 입력</h4>
                          <p className="text-gray-300">
                            찾고자 하는 키워드를 입력합니다. (예: "강남", "부가가치세", "250000")
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">검색 실행</h4>
                          <p className="text-gray-300">Enter 키를 누르거나 검색 버튼을 클릭합니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          4
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">결과 확인</h4>
                          <p className="text-gray-300">검색 결과 페이지에서 세금과 충전소 정보를 확인합니다.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-900/20 border border-purple-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-purple-400 mb-4">검색 예시</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">💡 효과적인 검색 키워드</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-green-400 font-semibold">✅ 좋은 예시</h5>
                            <ul className="text-gray-300 space-y-1">
                              <li>• "강남" → 강남 관련 충전소/세금</li>
                              <li>• "부가가치세" → 해당 세금 유형</li>
                              <li>• "250000" → 해당 금액의 세금</li>
                              <li>• "운영중" → 운영 중인 충전소</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-red-400 font-semibold">❌ 비효율적인 예시</h5>
                            <ul className="text-gray-300 space-y-1">
                              <li>• "ㄱ" → 너무 짧은 키워드</li>
                              <li>• "세금납부관리" → 너무 긴 키워드</li>
                              <li>• "123" → 의미 없는 숫자</li>
                              <li>• "ㅁㄴㅇㄹ" → 무의미한 문자</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">💡 검색 활용 팁</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>
                        • <strong>부분 검색:</strong> 전체 이름을 모르더라도 일부만 입력해도 검색됩니다
                      </li>
                      <li>
                        • <strong>숫자 검색:</strong> 금액의 일부만 입력해도 관련 세금을 찾을 수 있습니다
                      </li>
                      <li>
                        • <strong>상태 검색:</strong> "운영중", "점검중" 등으로 충전소 상태별 검색 가능
                      </li>
                      <li>
                        • <strong>빠른 접근:</strong> 검색 결과에서 "상세보기" 버튼으로 바로 이동할 수 있습니다
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 사용자 권한 */}
            {activeSection === "user-roles" && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">👥 사용자 권한</h2>

                <div className="space-y-8">
                  <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">권한 시스템 소개</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-4">
                      세무 관리 시스템은 관리자와 뷰어 두 가지 권한으로 구분됩니다. 상단 헤더에서 현재 권한을 확인하고
                      변경할 수 있습니다.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-800/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">👑 관리자 권한</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 모든 기능 사용 가능</li>
                          <li>• 세금/충전소/알림 등록</li>
                          <li>• 정보 수정 및 삭제</li>
                          <li>• 이메일 알림 전송</li>
                          <li>• 납부 상태 변경</li>
                        </ul>
                      </div>
                      <div className="bg-gray-700/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">👁️ 뷰어 권한</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 조회 기능만 사용 가능</li>
                          <li>• 세금/충전소 목록 확인</li>
                          <li>• 캘린더 일정 확인</li>
                          <li>• 통계 정보 확인</li>
                          <li>• 검색 기능 사용</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-400 mb-4">권한 변경 방법</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">권한 확인</h4>
                          <p className="text-gray-300">상단 헤더 검색창 옆에서 현재 권한을 확인합니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">드롭다운 클릭</h4>
                          <p className="text-gray-300">권한 표시 부분을 클릭하여 드롭다운 메뉴를 엽니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">권한 선택</h4>
                          <p className="text-gray-300">"관리자" 또는 "뷰어" 중 원하는 권한을 선택합니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          4
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">변경 완료</h4>
                          <p className="text-gray-300">권한이 즉시 변경되고 화면이 새로고침됩니다.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-900/20 border border-purple-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-purple-400 mb-4">권한별 화면 차이</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-3">👑 관리자 모드</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 사이드바에 모든 등록 버튼 표시</li>
                          <li>• 목록에서 수정/삭제 버튼 표시</li>
                          <li>• 납부 완료 처리 버튼 표시</li>
                          <li>• 이메일 알림 전송 버튼 표시</li>
                          <li>• 관리자 패널 접근 가능</li>
                        </ul>
                      </div>
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-3">👁️ 뷰어 모드</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 사이드바에서 등록 버튼 숨김</li>
                          <li>• 목록에서 수정/삭제 버튼 숨김</li>
                          <li>• 납부 처리 기능 비활성화</li>
                          <li>• "조회 전용" 배지 표시</li>
                          <li>• 관리자 패널 접근 불가</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">💡 권한 활용 가이드</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-white">언제 관리자 권한을 사용하나요?</h4>
                        <p className="text-gray-300">
                          세금 등록, 납부 처리, 충전소 관리 등 실제 업무를 처리할 때 관리자 권한을 사용하세요.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">언제 뷰어 권한을 사용하나요?</h4>
                        <p className="text-gray-300">
                          단순히 현황을 확인하거나, 실수로 데이터를 변경하는 것을 방지하고 싶을 때 뷰어 권한을
                          사용하세요.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">권한 변경이 안전한가요?</h4>
                        <p className="text-gray-300">
                          네, 권한 변경은 언제든지 가능하며 기존 데이터에는 영향을 주지 않습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 문제 해결 */}
            {activeSection === "troubleshooting" && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">🛠️ 문제 해결</h2>

                <div className="space-y-8">
                  <div className="bg-red-900/20 border border-red-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-red-400 mb-4">자주 발생하는 문제</h3>

                    <div className="space-y-6">
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">🔐 로그인 문제</h4>
                        <div className="space-y-2 text-gray-300">
                          <p>
                            <strong>문제:</strong> 로그인이 되지 않아요
                          </p>
                          <p>
                            <strong>해결:</strong>
                          </p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>이메일 주소와 비밀번호를 정확히 입력했는지 확인</li>
                            <li>대소문자 구분에 주의</li>
                            <li>브라우저 캐시 삭제 후 재시도</li>
                            <li>다른 브라우저에서 시도</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">📧 이메일 알림 문제</h4>
                        <div className="space-y-2 text-gray-300">
                          <p>
                            <strong>문제:</strong> 이메일 알림이 오지 않아요
                          </p>
                          <p>
                            <strong>해결:</strong>
                          </p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>스팸 메일함 확인</li>
                            <li>이메일 주소가 정확한지 확인</li>
                            <li>관리자에게 SendGrid 설정 상태 문의</li>
                            <li>5-10분 후 다시 확인 (발송 지연 가능)</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">📷 OCR 인식 문제</h4>
                        <div className="space-y-2 text-gray-300">
                          <p>
                            <strong>문제:</strong> 문서 인식이 정확하지 않아요
                          </p>
                          <p>
                            <strong>해결:</strong>
                          </p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>더 선명한 사진으로 다시 촬영</li>
                            <li>조명이 충분한 곳에서 촬영</li>
                            <li>문서가 평평하게 펼쳐진 상태로 촬영</li>
                            <li>인식 후 수동으로 정보 수정</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">🔍 검색 문제</h4>
                        <div className="space-y-2 text-gray-300">
                          <p>
                            <strong>문제:</strong> 검색 결과가 나오지 않아요
                          </p>
                          <p>
                            <strong>해결:</strong>
                          </p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>키워드를 더 간단하게 입력</li>
                            <li>부분 검색으로 시도 (예: "강남역" → "강남")</li>
                            <li>띄어쓰기 없이 입력</li>
                            <li>숫자는 정확히 입력</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">성능 최적화</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">🚀 속도 개선</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 브라우저 캐시 정기적 삭제</li>
                          <li>• 불필요한 탭 닫기</li>
                          <li>• 안정적인 인터넷 연결 사용</li>
                          <li>• 최신 브라우저 사용</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">💾 데이터 관리</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• 정기적인 데이터 백업</li>
                          <li>• 불필요한 데이터 정리</li>
                          <li>• 중복 데이터 확인</li>
                          <li>• 정확한 정보 입력</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-400 mb-4">브라우저 호환성</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">✅ 권장 브라우저</h4>
                        <ul className="space-y-1 text-gray-300">
                          <li>• Chrome (최신 버전)</li>
                          <li>• Firefox (최신 버전)</li>
                          <li>• Safari (최신 버전)</li>
                          <li>• Edge (최신 버전)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">⚠️ 주의사항</h4>
                        <ul className="space-y-1 text-gray-300">
                          <li>• Internet Explorer는 지원하지 않습니다</li>
                          <li>• 모바일 브라우저에서는 일부 기능이 제한될 수 있습니다</li>
                          <li>• JavaScript가 활성화되어 있어야 합니다</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">📞 추가 지원</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-white">문제가 계속 발생할 때</h4>
                        <p className="text-gray-300">
                          위의 해결 방법으로도 문제가 해결되지 않으면 시스템 관리자에게 문의하세요. 문제 상황을 자세히
                          설명해주시면 더 빠른 해결이 가능합니다.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">문의 시 포함할 정보</h4>
                        <ul className="text-gray-300 space-y-1">
                          <li>• 사용 중인 브라우저와 버전</li>
                          <li>• 문제가 발생한 정확한 시간</li>
                          <li>• 수행하려던 작업</li>
                          <li>• 오류 메시지 (있는 경우)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
