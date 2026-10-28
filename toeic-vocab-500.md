# 토익 빈출 단어 500

> 목표: 800점 이상 (2026-12-13 / 2026-12-27 응시)
> 학습량: 하루 최대 30개 (새 단어 10개 + 복습 최대 20개) × 52일

## 데이터 형식 (프로그램 구현용)

- 단어 10개를 1개 Set로 묶어 총 50 Set (Set 01–50)
- 각 Set는 `## Set NN` 헤더 아래 표 1개(10행)로 구성
- 열: `No | 단어 | 품사 | 뜻 | 짝꿍 표현`
- `No`는 1~500 전체 일련번호
- 품사: `v.` 동사 · `n.` 명사 · `adj.` 형용사 · `adv.` 부사(접속부사 포함) · `prep.` 전치사(구) · `conj.` 접속사 · `phr.` 구
- Set 구성: 동사 3 · 명사 2 · 형용사 2 · 부사 2 · 전치사/접속사 1
- 짝꿍 표현의 `A`, `B`, `~`는 자리표시자
- 순서: 빈출도가 높은 Set가 앞 번호 (Set 01–40 핵심, Set 41–50 보강)

## 학습 구조 (3 Set 슬라이딩, 시작·끝 단계적)

- 규칙: d일차 학습 Set = `max(1, d-2)` ~ `min(50, d)` (d = 1 ~ 52)
- 새 Set: d일차의 Set d (d ≤ 50), 51·52일차는 새 단어 없이 복습만
- 모든 Set가 정확히 3일 연속 학습됨 (Set s → s일차, s+1일차, s+2일차)

| 학습일 | 학습 Set | 새 단어 | 복습 | 합계 |
|---|---|---:|---:|---:|
| 1일차 | Set 1 | 10 | 0 | 10 |
| 2일차 | Set 1·2 | 10 | 10 | 20 |
| 3일차 | Set 1·2·3 | 10 | 20 | 30 |
| 4일차 | Set 2·3·4 | 10 | 20 | 30 |
| … | … | 10 | 20 | 30 |
| 50일차 | Set 48·49·50 | 10 | 20 | 30 |
| 51일차 | Set 49·50 | 0 | 20 | 20 |
| 52일차 | Set 50 | 0 | 10 | 10 |

- 퀴즈 모드: 단어 → 뜻, 뜻 → 단어, 짝꿍 표현 빈칸 채우기

---

## Set 01

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 1 | submit | v. | 제출하다 | submit an application |
| 2 | comply | v. | 준수하다 | comply with regulations |
| 3 | attend | v. | 참석하다 | attend a meeting |
| 4 | deadline | n. | 마감일 | meet the deadline |
| 5 | reservation | n. | 예약 | make a reservation |
| 6 | available | adj. | 이용 가능한, 시간이 되는 | available for purchase |
| 7 | eligible | adj. | 자격이 있는 | be eligible for |
| 8 | promptly | adv. | 즉시, 정각에 | promptly at 9 A.M. |
| 9 | approximately | adv. | 대략 | approximately 30 minutes |
| 10 | despite | prep. | ~에도 불구하고 (뒤에 명사) | despite the rain |

## Set 02

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 11 | conduct | v. | 실시하다 | conduct a survey |
| 12 | implement | v. | 시행하다 | implement a new policy |
| 13 | accommodate | v. | 수용하다, 편의를 도모하다 | accommodate up to 200 guests |
| 14 | applicant | n. | 지원자 | qualified applicants |
| 15 | candidate | n. | 후보자 | the ideal candidate |
| 16 | responsible | adj. | 책임이 있는 | be responsible for |
| 17 | complimentary | adj. | 무료의 | complimentary breakfast |
| 18 | currently | adv. | 현재 | be currently available |
| 19 | recently | adv. | 최근에 | have recently hired |
| 20 | although | conj. | 비록 ~이지만 (뒤에 절) | Although sales rose, ~ |

## Set 03

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 21 | confirm | v. | 확인하다 | confirm a reservation |
| 22 | ensure | v. | 보장하다, 확실히 하다 | ensure that ~ |
| 23 | postpone | v. | 연기하다 | postpone the meeting |
| 24 | expense | n. | 비용 | travel expenses |
| 25 | budget | n. | 예산 | within budget |
| 26 | mandatory | adj. | 의무적인 | mandatory training |
| 27 | affordable | adj. | 저렴한, 감당할 수 있는 | affordable prices |
| 28 | temporarily | adv. | 일시적으로 | be temporarily closed |
| 29 | shortly | adv. | 곧, 직후에 | shortly after the meeting |
| 30 | due to | prep. | ~ 때문에 | due to bad weather |

## Set 04

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 31 | notify | v. | 통지하다 | notify A of B |
| 32 | expand | v. | 확장하다 | expand into new markets |
| 33 | enhance | v. | 향상시키다 | enhance productivity |
| 34 | facility | n. | 시설 | manufacturing facility |
| 35 | equipment | n. | 장비 (셀 수 없음) | office equipment |
| 36 | upcoming | adj. | 다가오는 | the upcoming conference |
| 37 | additional | adj. | 추가의 | additional charge |
| 38 | significantly | adv. | 상당히, 크게 | significantly reduce costs |
| 39 | previously | adv. | 이전에 | as previously announced |
| 40 | prior to | prep. | ~ 전에 | prior to the meeting |

## Set 05

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 41 | reimburse | v. | 상환하다, 환급하다 | reimburse travel expenses |
| 42 | renovate | v. | 개조하다, 보수하다 | renovate the lobby |
| 43 | relocate | v. | 이전하다 | relocate to a new office |
| 44 | inventory | n. | 재고, 재고 목록 | take inventory |
| 45 | maintenance | n. | 유지 보수 | scheduled maintenance |
| 46 | qualified | adj. | 자격을 갖춘 | qualified candidates |
| 47 | comprehensive | adj. | 포괄적인 | comprehensive guide |
| 48 | immediately | adv. | 즉시 | effective immediately |
| 49 | regularly | adv. | 정기적으로 | be regularly inspected |
| 50 | unless | conj. | ~하지 않는 한 | unless otherwise noted |

## Set 06

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 51 | participate | v. | 참가하다 | participate in |
| 52 | register | v. | 등록하다 | register for a workshop |
| 53 | inquire | v. | 문의하다 | inquire about |
| 54 | renovation | n. | 보수 공사 | under renovation |
| 55 | regulation | n. | 규정 | safety regulations |
| 56 | extensive | adj. | 광범위한, 폭넓은 | extensive experience |
| 57 | constructive | adj. | 건설적인 | constructive feedback |
| 58 | conveniently | adv. | 편리하게 | conveniently located |
| 59 | exclusively | adv. | 오로지, 독점적으로 | exclusively for members |
| 60 | regarding | prep. | ~에 관하여 | questions regarding the order |

## Set 07

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 61 | anticipate | v. | 예상하다 | than anticipated |
| 62 | acquire | v. | 인수하다, 획득하다 | acquire a company |
| 63 | address | v. | (문제를) 다루다, 연설하다 | address concerns |
| 64 | requirement | n. | 요건 | meet the requirements |
| 65 | procedure | n. | 절차 | follow the procedure |
| 66 | tremendous | adj. | 엄청난 | tremendous success |
| 67 | outdated | adj. | 구식의 | outdated equipment |
| 68 | primarily | adv. | 주로 | primarily responsible for |
| 69 | considerably | adv. | 상당히 | considerably higher |
| 70 | within | prep. | ~ 이내에 | within 30 days |

## Set 08

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 71 | allocate | v. | 할당하다 | allocate funds |
| 72 | assign | v. | 배정하다 | be assigned to |
| 73 | approve | v. | 승인하다 | approve the budget |
| 74 | policy | n. | 정책, 방침 | refund policy |
| 75 | proposal | n. | 제안(서) | submit a proposal |
| 76 | routine | adj. | 일상적인, 정기적인 | routine maintenance |
| 77 | pending | adj. | 보류 중인, 미결의 | pending approval |
| 78 | thoroughly | adv. | 철저히 | thoroughly inspect |
| 79 | carefully | adv. | 주의 깊게 | read carefully |
| 80 | throughout | prep. | ~ 내내, ~ 전역에 | throughout the year |

## Set 09

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 81 | extend | v. | 연장하다, (감사를) 전하다 | extend the deadline |
| 82 | exceed | v. | 초과하다 | exceed expectations |
| 83 | launch | v. | 출시하다, 시작하다 | launch a new product |
| 84 | contract | n. | 계약(서) | sign a contract |
| 85 | agreement | n. | 합의, 계약 | reach an agreement |
| 86 | accessible | adj. | 접근 가능한 | accessible to the public |
| 87 | adjacent | adj. | 인접한 | adjacent to the lobby |
| 88 | tentatively | adv. | 잠정적으로 | tentatively scheduled for |
| 89 | nearly | adv. | 거의 | nearly complete |
| 90 | however | adv. | 그러나 (접속부사) | However, ~ |

## Set 10

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 91 | merge | v. | 합병하다 | merge with |
| 92 | obtain | v. | 얻다, 획득하다 | obtain approval |
| 93 | oversee | v. | 감독하다 | oversee a project |
| 94 | invoice | n. | 청구서, 송장 | send an invoice |
| 95 | receipt | n. | 영수증, 수령 | upon receipt of |
| 96 | subject | adj. | ~의 대상인, ~되기 쉬운 | be subject to change |
| 97 | effective | adj. | 효과적인, (정책이) 시행되는 | effective May 1 |
| 98 | directly | adv. | 직접, 곧장 | report directly to |
| 99 | separately | adv. | 따로 | sold separately |
| 100 | therefore | adv. | 그러므로 (접속부사) | ~; therefore, ~ |

## Set 11

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 101 | promote | v. | 승진시키다, 홍보하다 | be promoted to manager |
| 102 | provide | v. | 제공하다 | provide A with B |
| 103 | qualify | v. | 자격을 얻다 | qualify for a discount |
| 104 | refund | n. | 환불 | full refund |
| 105 | warranty | n. | 품질 보증 | under warranty |
| 106 | proactive | adj. | 적극적인, 선제적인 | proactive approach |
| 107 | reliable | adj. | 믿을 수 있는 | reliable service |
| 108 | steadily | adv. | 꾸준히 | grow steadily |
| 109 | remotely | adv. | 원격으로 | work remotely |
| 110 | following | prep. | ~ 후에 | following the presentation |

## Set 12

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 111 | recommend | v. | 추천하다, 권고하다 | recommend that ~ (should) do |
| 112 | reduce | v. | 줄이다 | reduce costs |
| 113 | refer | v. | 참조하다, 언급하다 | refer to the manual |
| 114 | shipment | n. | 배송(품) | delay a shipment |
| 115 | supplier | n. | 공급업체 | a reliable supplier |
| 116 | appropriate | adj. | 적절한 | appropriate for |
| 117 | suitable | adj. | 적합한 | suitable for beginners |
| 118 | highly | adv. | 매우 | highly recommended |
| 119 | strongly | adv. | 강력히 | be strongly encouraged to |
| 120 | upon | prep. | ~하자마자, ~ 시에 | upon arrival |

## Set 13

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 121 | rely | v. | 의존하다 | rely on |
| 122 | remind | v. | 상기시키다 | remind A to do |
| 123 | replace | v. | 교체하다 | replace A with B |
| 124 | revenue | n. | 수익, 매출 | annual revenue |
| 125 | profit | n. | 이익 | profit margin |
| 126 | relevant | adj. | 관련 있는 | relevant experience |
| 127 | authentic | adj. | 진짜의, 정통의 | authentic cuisine |
| 128 | newly | adv. | 새로 | newly renovated |
| 129 | fully | adv. | 완전히 | fully refundable |
| 130 | according to | prep. | ~에 따르면 | according to the report |

## Set 14

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 131 | require | v. | 요구하다 | be required to do |
| 132 | resolve | v. | 해결하다 | resolve an issue |
| 133 | respond | v. | 응답하다 | respond to inquiries |
| 134 | outlet | n. | 매장, 콘센트 | retail outlet |
| 135 | subsidiary | n. | 자회사 | overseas subsidiary |
| 136 | ongoing | adj. | 진행 중인 | ongoing project |
| 137 | existing | adj. | 기존의 | existing customers |
| 138 | readily | adv. | 쉽게, 기꺼이 | readily available |
| 139 | widely | adv. | 널리 | widely used |
| 140 | because of | prep. | ~ 때문에 | because of the delay |

## Set 15

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 141 | resume | v. | 재개하다 | resume operations |
| 142 | review | v. | 검토하다 | review the contract |
| 143 | revise | v. | 수정하다 | revise a draft |
| 144 | branch | n. | 지점 | open a new branch |
| 145 | headquarters | n. | 본사 | corporate headquarters |
| 146 | prospective | adj. | 장래의, 예비의 | prospective clients |
| 147 | potential | adj. | 잠재적인 | potential customers |
| 148 | closely | adv. | 면밀히, 긴밀히 | work closely with |
| 149 | accordingly | adv. | 그에 맞게 | adjust accordingly |
| 150 | even though | conj. | 비록 ~일지라도 | even though it was late |

## Set 16

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 151 | schedule | v. | 일정을 잡다 | be scheduled for / to do |
| 152 | secure | v. | 확보하다 | secure funding |
| 153 | specialize | v. | 전문으로 하다 | specialize in |
| 154 | department | n. | 부서 | sales department |
| 155 | personnel | n. | 직원들, 인사과 | personnel changes |
| 156 | competitive | adj. | 경쟁력 있는 | competitive salary |
| 157 | valuable | adj. | 귀중한 | valuable input |
| 158 | efficiently | adv. | 효율적으로 | operate efficiently |
| 159 | simultaneously | adv. | 동시에 | occur simultaneously |
| 160 | while | conj. | ~하는 동안, ~인 반면 | while you wait |

## Set 17

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 161 | supervise | v. | 감독하다 | supervise new staff |
| 162 | transfer | v. | 전근하다, 옮기다 | transfer to another branch |
| 163 | undergo | v. | 겪다, 받다 | undergo renovations |
| 164 | supervisor | n. | 상사, 감독관 | immediate supervisor |
| 165 | colleague | n. | 동료 | a former colleague |
| 166 | valid | adj. | 유효한 | valid ID |
| 167 | confidential | adj. | 기밀의 | confidential information |
| 168 | successfully | adv. | 성공적으로 | successfully completed |
| 169 | relatively | adv. | 비교적 | relatively low |
| 170 | as of | prep. | ~부로, ~ 현재 | as of May 1 |

## Set 18

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 171 | verify | v. | 확인하다, 검증하다 | verify the information |
| 172 | waive | v. | 면제하다 | waive the fee |
| 173 | contribute | v. | 기여하다 | contribute to |
| 174 | representative | n. | 직원, 대표자 | sales representative |
| 175 | correspondence | n. | 서신, 연락 | business correspondence |
| 176 | aware | adj. | 알고 있는 | be aware of |
| 177 | capable | adj. | ~할 수 있는 | be capable of -ing |
| 178 | slightly | adv. | 약간 | slightly higher |
| 179 | sharply | adv. | 급격히 | rise sharply |
| 180 | in addition to | prep. | ~ 외에도 | in addition to salary |

## Set 19

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 181 | collaborate | v. | 협력하다 | collaborate with |
| 182 | consult | v. | 상담하다, 참고하다 | consult the manual |
| 183 | distribute | v. | 배포하다 | distribute handouts |
| 184 | expertise | n. | 전문 지식 | expertise in |
| 185 | position | n. | 직책, 자리 | apply for the position |
| 186 | compatible | adj. | 호환되는 | compatible with |
| 187 | comparable | adj. | 비슷한, 비교할 만한 | comparable to |
| 188 | gradually | adv. | 점차 | gradually increase |
| 189 | rapidly | adv. | 빠르게 | rapidly growing |
| 190 | instead of | prep. | ~ 대신에 | instead of e-mail |

## Set 20

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 191 | enroll | v. | 등록하다 | enroll in a course |
| 192 | evaluate | v. | 평가하다 | evaluate performance |
| 193 | assess | v. | 평가하다, 산정하다 | assess the damage |
| 194 | vacancy | n. | 공석, 빈방 | fill a vacancy |
| 195 | promotion | n. | 승진, 판촉 | get a promotion |
| 196 | consistent | adj. | 일관된, 일치하는 | consistent with |
| 197 | unprecedented | adj. | 전례 없는 | unprecedented growth |
| 198 | dramatically | adv. | 극적으로 | increase dramatically |
| 199 | substantially | adv. | 상당히 | substantially lower |
| 200 | on behalf of | prep. | ~을 대표하여, ~ 대신 | on behalf of the company |

## Set 21

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 201 | forward | v. | 전달하다 | forward an e-mail |
| 202 | fulfill | v. | 이행하다, 충족시키다 | fulfill an order |
| 203 | generate | v. | 창출하다 | generate revenue |
| 204 | performance | n. | 성과, 공연 | performance review |
| 205 | brochure | n. | 안내 책자 | product brochure |
| 206 | experienced | adj. | 숙련된, 경험 많은 | experienced staff |
| 207 | knowledgeable | adj. | 박식한 | knowledgeable about |
| 208 | initially | adv. | 처음에 | initially planned |
| 209 | originally | adv. | 원래 | originally scheduled for |
| 210 | provided that | conj. | ~라면 | provided that you register |

## Set 22

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 211 | inform | v. | 알리다 | inform A of B |
| 212 | inspect | v. | 점검하다 | inspect equipment |
| 213 | install | v. | 설치하다 | install software |
| 214 | survey | n. | 설문 조사 | customer survey |
| 215 | feedback | n. | 의견 (셀 수 없음) | provide feedback |
| 216 | proficient | adj. | 능숙한 | proficient in |
| 217 | outstanding | adj. | 뛰어난, 미지불의 | outstanding balance |
| 218 | eventually | adv. | 결국 | eventually agreed |
| 219 | subsequently | adv. | 그 후에 | subsequently approved |
| 220 | once | conj. | 일단 ~하면 | once approved |

## Set 23

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 221 | maintain | v. | 유지하다 | maintain records |
| 222 | modify | v. | 수정하다 | modify the design |
| 223 | negotiate | v. | 협상하다 | negotiate a contract |
| 224 | complaint | n. | 불만, 항의 | file a complaint |
| 225 | inquiry | n. | 문의 | customer inquiries |
| 226 | overdue | adj. | 기한이 지난 | overdue payment |
| 227 | defective | adj. | 결함 있는 | defective product |
| 228 | frequently | adv. | 자주 | frequently asked questions |
| 229 | occasionally | adv. | 가끔 | occasionally work overtime |
| 230 | until | prep. | ~까지 (계속) | valid until Friday |

## Set 24

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 231 | operate | v. | 운영하다, 작동하다 | operate machinery |
| 232 | prevent | v. | 막다 | prevent A from -ing |
| 233 | proceed | v. | 진행하다, 나아가다 | proceed with / proceed to |
| 234 | response | n. | 응답, 반응 | in response to |
| 235 | logistics | n. | 물류, 세부 준비 | handle the logistics |
| 236 | durable | adj. | 내구성 있는 | durable material |
| 237 | flexible | adj. | 유연한 | flexible schedule |
| 238 | periodically | adv. | 주기적으로 | be periodically updated |
| 239 | momentarily | adv. | 곧, 잠시 | be with you momentarily |
| 240 | by | prep. | ~까지 (완료) | submit by Friday |

## Set 25

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 241 | prohibit | v. | 금지하다 | prohibit A from -ing |
| 242 | purchase | v. | 구매하다 | purchase tickets |
| 243 | assemble | v. | 조립하다, 모으다 | assemble the parts |
| 244 | attendee | n. | 참석자 | conference attendees |
| 245 | venue | n. | 장소 | the venue for the event |
| 246 | courteous | adj. | 정중한 | courteous staff |
| 247 | spacious | adj. | 넓은 | spacious office |
| 248 | specifically | adv. | 특별히, 구체적으로 | specifically designed for |
| 249 | particularly | adv. | 특히 | particularly popular |
| 250 | in order to | phr. | ~하기 위해 | in order to save time |

## Set 26

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 251 | retain | v. | 보유하다, 유지하다 | retain customers |
| 252 | reveal | v. | 밝히다 | reveal plans |
| 253 | seek | v. | 구하다, 찾다 | seek a new manager |
| 254 | itinerary | n. | 여행 일정표 | travel itinerary |
| 255 | accommodation | n. | 숙박 시설 | hotel accommodations |
| 256 | essential | adj. | 필수적인 | essential for |
| 257 | necessary | adj. | 필요한 | if necessary |
| 258 | especially | adv. | 특히 | especially for beginners |
| 259 | mainly | adv. | 주로 | mainly due to |
| 260 | so that | conj. | ~하도록 | so that we can ~ |

## Set 27

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 261 | streamline | v. | 간소화하다 | streamline the process |
| 262 | suspend | v. | 중단하다, 정지하다 | suspend service |
| 263 | utilize | v. | 활용하다 | utilize resources |
| 264 | amenity | n. | 편의 시설 | hotel amenities |
| 265 | capacity | n. | 수용력, 역량 | seating capacity |
| 266 | sufficient | adj. | 충분한 | sufficient funds |
| 267 | adequate | adj. | 적절한, 충분한 | adequate staffing |
| 268 | largely | adv. | 대체로, 주로 | largely because of |
| 269 | solely | adv. | 오로지 | solely responsible for |
| 270 | whether | conj. | ~인지 아닌지 | whether or not |

## Set 28

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 271 | withdraw | v. | 철회하다, 인출하다 | withdraw money |
| 272 | acknowledge | v. | 인정하다, 수령을 알리다 | acknowledge receipt of |
| 273 | adhere | v. | 고수하다, 준수하다 | adhere to guidelines |
| 274 | admission | n. | 입장(료), 입학 | admission fee |
| 275 | duration | n. | 지속 기간 | for the duration of |
| 276 | advanced | adj. | 고급의, 진보한 | advanced degree |
| 277 | detailed | adj. | 상세한 | detailed description |
| 278 | entirely | adv. | 전적으로 | entirely new |
| 279 | completely | adv. | 완전히 | completely sold out |
| 280 | moreover | adv. | 게다가 (접속부사) | Moreover, ~ |

## Set 29

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 281 | appoint | v. | 임명하다 | be appointed as |
| 282 | arrange | v. | 마련하다, 준비하다 | arrange a meeting |
| 283 | assist | v. | 돕다 | assist with |
| 284 | subscription | n. | 구독 | subscription to a magazine |
| 285 | permission | n. | 허가 | ask for permission |
| 286 | rigorous | adj. | 엄격한 | rigorous testing |
| 287 | preliminary | adj. | 예비의 | preliminary results |
| 288 | reasonably | adv. | 합리적으로 | reasonably priced |
| 289 | explicitly | adv. | 명시적으로 | explicitly state |
| 290 | furthermore | adv. | 더욱이 (접속부사) | Furthermore, ~ |

## Set 30

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 291 | attract | v. | 끌어들이다 | attract customers |
| 292 | authorize | v. | 권한을 주다, 승인하다 | authorized personnel |
| 293 | cancel | v. | 취소하다 | cancel an order |
| 294 | permit | n. | 허가증 | parking permit |
| 295 | approval | n. | 승인 | prior approval |
| 296 | annual | adj. | 연례의, 연간의 | annual meeting |
| 297 | multiple | adj. | 다수의 | multiple locations |
| 298 | ideally | adv. | 이상적으로 | ideally located |
| 299 | centrally | adv. | 중심부에 | centrally located |
| 300 | consequently | adv. | 그 결과 (접속부사) | Consequently, ~ |

## Set 31

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 301 | commence | v. | 시작하다 | commence construction |
| 302 | compensate | v. | 보상하다 | compensate for |
| 303 | coordinate | v. | 조정하다, 조율하다 | coordinate an event |
| 304 | authority | n. | 권한, 당국 | have the authority to |
| 305 | compliance | n. | 준수 | in compliance with |
| 306 | numerous | adj. | 수많은 | numerous awards |
| 307 | diverse | adj. | 다양한 | a diverse range of |
| 308 | automatically | adv. | 자동으로 | be automatically renewed |
| 309 | electronically | adv. | 전자적으로 | submit electronically |
| 310 | nevertheless | adv. | 그럼에도 불구하고 (접속부사) | Nevertheless, ~ |

## Set 32

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 311 | dedicate | v. | 바치다, 전념하다 | be dedicated to |
| 312 | delegate | v. | 위임하다 | delegate tasks |
| 313 | demonstrate | v. | 시연하다, 입증하다 | demonstrate a product |
| 314 | priority | n. | 우선순위 | top priority |
| 315 | preference | n. | 선호 | dietary preferences |
| 316 | sophisticated | adj. | 정교한, 세련된 | sophisticated technology |
| 317 | innovative | adj. | 혁신적인 | innovative design |
| 318 | personally | adv. | 직접, 개인적으로 | personally greet |
| 319 | punctually | adv. | 시간을 엄수하여 | arrive punctually |
| 320 | otherwise | adv. | 그렇지 않으면 (접속부사) | ~; otherwise, ~ |

## Set 33

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 321 | designate | v. | 지정하다 | designated area |
| 322 | eliminate | v. | 없애다 | eliminate errors |
| 323 | encourage | v. | 장려하다 | be encouraged to do |
| 324 | alternative | n. | 대안 | an alternative to |
| 325 | opportunity | n. | 기회 | opportunity for advancement |
| 326 | renowned | adj. | 유명한 | renowned for |
| 327 | prominent | adj. | 저명한, 두드러진 | prominent figure |
| 328 | accurately | adv. | 정확하게 | accurately reflect |
| 329 | precisely | adv. | 정확히 | at precisely 10 A.M. |
| 330 | meanwhile | adv. | 한편, 그동안 (접속부사) | Meanwhile, ~ |

## Set 34

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 331 | establish | v. | 설립하다 | establish a branch |
| 332 | estimate | v. | 추정하다 | estimated cost |
| 333 | expire | v. | 만료되다 | expire at the end of |
| 334 | recognition | n. | 인정, 표창 | in recognition of |
| 335 | reputation | n. | 평판 | reputation for quality |
| 336 | reputable | adj. | 평판 좋은 | reputable company |
| 337 | lucrative | adj. | 수익성이 좋은 | lucrative contract |
| 338 | properly | adv. | 제대로 | function properly |
| 339 | adversely | adv. | 불리하게 | adversely affect |
| 340 | in spite of | prep. | ~에도 불구하고 | in spite of the cost |

## Set 35

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 341 | facilitate | v. | 용이하게 하다 | facilitate communication |
| 342 | finalize | v. | 마무리하다 | finalize the details |
| 343 | grant | v. | 승인하다, 주다 | grant permission |
| 344 | commitment | n. | 헌신, 약속 | commitment to quality |
| 345 | initiative | n. | 계획, 진취성 | a new initiative |
| 346 | promising | adj. | 유망한 | promising candidate |
| 347 | impressive | adj. | 인상적인 | impressive results |
| 348 | evenly | adv. | 고르게 | evenly distributed |
| 349 | increasingly | adv. | 점점 더 | increasingly popular |
| 350 | whereas | conj. | 반면에 | whereas B ~ |

## Set 36

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 351 | indicate | v. | 나타내다, 보여주다 | indicate that ~ |
| 352 | instruct | v. | 지시하다 | be instructed to do |
| 353 | invest | v. | 투자하다 | invest in |
| 354 | strategy | n. | 전략 | marketing strategy |
| 355 | objective | n. | 목표 | main objective |
| 356 | remarkable | adj. | 놀라운, 주목할 만한 | remarkable achievement |
| 357 | informative | adj. | 유익한 | informative session |
| 358 | unexpectedly | adv. | 예상치 못하게 | unexpectedly delayed |
| 359 | unanimously | adv. | 만장일치로 | unanimously approved |
| 360 | now that | conj. | 이제 ~이므로 | now that the project is complete |

## Set 37

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 361 | issue | v. | 발급하다, 발행하다 | issue a refund |
| 362 | monitor | v. | 감시하다, 관찰하다 | monitor progress |
| 363 | outline | v. | 개요를 설명하다 | outline the plan |
| 364 | outcome | n. | 결과 | the outcome of the meeting |
| 365 | productivity | n. | 생산성 | boost productivity |
| 366 | beneficial | adj. | 유익한 | beneficial to |
| 367 | critical | adj. | 매우 중요한 | critical to success |
| 368 | jointly | adv. | 공동으로 | jointly owned |
| 369 | respectively | adv. | 각각 | A and B, respectively |
| 370 | in case | conj. | ~할 경우에 대비해 | in case it rains |

## Set 38

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 371 | predict | v. | 예측하다 | predict growth |
| 372 | recruit | v. | 모집하다, 채용하다 | recruit staff |
| 373 | refrain | v. | 삼가다 | refrain from -ing |
| 374 | efficiency | n. | 효율 | energy efficiency |
| 375 | demand | n. | 수요 | in high demand |
| 376 | vital | adj. | 필수적인 | vital to |
| 377 | urgent | adj. | 긴급한 | urgent matter |
| 378 | alternatively | adv. | 대안으로, 그 대신 | Alternatively, you can ~ |
| 379 | virtually | adv. | 사실상 | virtually impossible |
| 380 | as long as | conj. | ~하는 한 | as long as you ~ |

## Set 39

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 381 | reject | v. | 거절하다 | reject an offer |
| 382 | renew | v. | 갱신하다 | renew a subscription |
| 383 | exhibit | v. | 전시하다, 보이다 | exhibit artwork |
| 384 | shortage | n. | 부족 | labor shortage |
| 385 | delay | n. | 지연 | without delay |
| 386 | immediate | adj. | 즉각적인, 직속의 | immediate attention |
| 387 | optional | adj. | 선택적인 | optional tour |
| 388 | mutually | adv. | 상호 간에 | mutually beneficial |
| 389 | favorably | adv. | 호의적으로 | be reviewed favorably |
| 390 | except for | prep. | ~을 제외하고 | except for Sundays |

## Set 40

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 391 | resign | v. | 사임하다 | resign from |
| 392 | retire | v. | 은퇴하다 | retire from |
| 393 | succeed | v. | 성공하다, 뒤를 잇다 | succeed A as CEO |
| 394 | malfunction | n. | 오작동 | equipment malfunction |
| 395 | replacement | n. | 교체(품), 후임자 | find a replacement |
| 396 | applicable | adj. | 적용 가능한 | applicable to |
| 397 | excessive | adj. | 과도한 | excessive use |
| 398 | heavily | adv. | 크게, 몹시 | rely heavily on |
| 399 | diligently | adv. | 부지런히 | work diligently |
| 400 | regardless of | prep. | ~와 관계없이 | regardless of age |

## Set 41

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 401 | surpass | v. | 능가하다 | surpass sales targets |
| 402 | accompany | v. | 동반하다 | be accompanied by |
| 403 | achieve | v. | 달성하다 | achieve a goal |
| 404 | component | n. | 부품, 구성 요소 | key component |
| 405 | specification | n. | 사양, 명세 | product specifications |
| 406 | minimal | adj. | 최소의 | minimal cost |
| 407 | moderate | adj. | 적당한 | moderate price |
| 408 | securely | adv. | 안전하게 | securely stored |
| 409 | permanently | adv. | 영구적으로 | permanently closed |
| 410 | in accordance with | prep. | ~에 따라 | in accordance with the policy |

## Set 42

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 411 | adopt | v. | 채택하다 | adopt a policy |
| 412 | advise | v. | 조언하다, 알리다 | be advised to do |
| 413 | assure | v. | 장담하다, 안심시키다 | rest assured |
| 414 | criteria | n. | 기준 (단수 criterion) | selection criteria |
| 415 | certificate | n. | 증명서, 상품권 | gift certificate |
| 416 | stable | adj. | 안정된 | stable income |
| 417 | attentive | adj. | 세심한 | attentive to |
| 418 | indefinitely | adv. | 무기한으로 | postponed indefinitely |
| 419 | briefly | adv. | 잠시, 간단히 | briefly describe |
| 420 | along with | prep. | ~와 함께 | along with a receipt |

## Set 43

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 421 | attribute | v. | ~의 덕분(탓)으로 보다 | attribute A to B |
| 422 | comprise | v. | 구성하다 | be comprised of |
| 423 | consist | v. | 구성되다 | consist of |
| 424 | transaction | n. | 거래 | online transaction |
| 425 | balance | n. | 잔액 | account balance |
| 426 | considerate | adj. | 사려 깊은 | considerate of others |
| 427 | eager | adj. | 열망하는 | be eager to do |
| 428 | beforehand | adv. | 미리 | notify us beforehand |
| 429 | noticeably | adv. | 눈에 띄게 | noticeably improved |
| 430 | ahead of | prep. | ~보다 앞서 | ahead of schedule |

## Set 44

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 431 | deem | v. | 여기다 | be deemed necessary |
| 432 | enclose | v. | 동봉하다 | Enclosed is ~ |
| 433 | endorse | v. | 보증하다, 지지하다 | endorse a product |
| 434 | deposit | n. | 보증금, 예금 | security deposit |
| 435 | agenda | n. | 의제, 안건 | on the agenda |
| 436 | willing | adj. | 기꺼이 하는 | be willing to do |
| 437 | reluctant | adj. | 꺼리는 | be reluctant to do |
| 438 | exceptionally | adv. | 유난히, 특별히 | exceptionally well |
| 439 | overwhelmingly | adv. | 압도적으로 | overwhelmingly positive |
| 440 | in light of | prep. | ~을 고려하여 | in light of recent events |

## Set 45

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 441 | entitle | v. | 자격을 주다 | be entitled to |
| 442 | excel | v. | 뛰어나다 | excel at |
| 443 | incorporate | v. | 포함하다, 반영하다 | incorporate feedback |
| 444 | statement | n. | 명세서, 성명 | bank statement |
| 445 | incentive | n. | 장려책, 보상금 | financial incentive |
| 446 | hesitant | adj. | 주저하는 | be hesitant to do |
| 447 | liable | adj. | 법적 책임이 있는 | be liable for |
| 448 | publicly | adv. | 공개적으로 | publicly announced |
| 449 | officially | adv. | 공식적으로 | officially open |
| 450 | as soon as | conj. | ~하자마자 | as soon as possible |

## Set 46

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 451 | prioritize | v. | 우선순위를 정하다 | prioritize tasks |
| 452 | solicit | v. | 요청하다, 간청하다 | solicit donations |
| 453 | terminate | v. | 종료하다 | terminate a contract |
| 454 | probation | n. | 수습 기간 | probation period |
| 455 | merchandise | n. | 상품 (셀 수 없음) | return merchandise |
| 456 | perishable | adj. | 상하기 쉬운 | perishable goods |
| 457 | inclement | adj. | (날씨가) 궂은 | inclement weather |
| 458 | actively | adv. | 적극적으로 | actively seek |
| 459 | collectively | adv. | 공동으로, 합쳐서 | collectively decide |
| 460 | owing to | prep. | ~ 때문에 | owing to high demand |

## Set 47

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 461 | vacate | v. | 비우다 | vacate the room |
| 462 | alleviate | v. | 완화하다 | alleviate traffic congestion |
| 463 | clarify | v. | 명확히 하다 | clarify the policy |
| 464 | refreshments | n. | 다과 | light refreshments |
| 465 | attire | n. | 복장 | business attire |
| 466 | anonymous | adj. | 익명의 | anonymous survey |
| 467 | lengthy | adj. | 긴, 장황한 | lengthy process |
| 468 | reportedly | adv. | 전하는 바에 따르면 | is reportedly planning |
| 469 | seldom | adv. | 좀처럼 ~ 않는 | seldom late |
| 470 | beyond | prep. | ~을 넘어서 | beyond our control |

## Set 48

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 471 | commend | v. | 칭찬하다 | commend A for B |
| 472 | consolidate | v. | 통합하다 | consolidate offices |
| 473 | deduct | v. | 공제하다 | deduct from salary |
| 474 | premises | n. | 구내, 부지 | on the premises |
| 475 | proximity | n. | 근접 | in close proximity to |
| 476 | seasonal | adj. | 계절적인 | seasonal demand |
| 477 | operational | adj. | 가동 중인 | fully operational |
| 478 | rarely | adv. | 드물게 | rarely used |
| 479 | hardly | adv. | 거의 ~ 않다 | hardly ever |
| 480 | in terms of | prep. | ~ 면에서 | in terms of quality |

## Set 49

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 481 | discontinue | v. | 중단하다 | discontinued product |
| 482 | substitute | v. | 대체하다 | substitute A for B |
| 483 | tailor | v. | 맞추다 | tailored to your needs |
| 484 | tenant | n. | 세입자 | building tenants |
| 485 | patron | n. | 고객, 후원자 | library patrons |
| 486 | interim | adj. | 임시의 | interim manager |
| 487 | feasible | adj. | 실현 가능한 | feasible plan |
| 488 | manually | adv. | 수동으로 | enter data manually |
| 489 | abruptly | adv. | 갑자기 | end abruptly |
| 490 | as a result of | prep. | ~의 결과로 | as a result of the merger |

## Set 50

| No | 단어 | 품사 | 뜻 | 짝꿍 표현 |
|---:|---|---|---|---|
| 491 | specify | v. | 명시하다 | unless otherwise specified |
| 492 | reflect | v. | 반영하다 | reflect recent changes |
| 493 | account | v. | 설명하다, 차지하다 | account for 30% of sales |
| 494 | turnout | n. | 참가자 수 | a large turnout |
| 495 | precaution | n. | 예방 조치 | take precautions |
| 496 | versatile | adj. | 다용도의, 다재다능한 | versatile tool |
| 497 | sturdy | adj. | 튼튼한 | sturdy construction |
| 498 | markedly | adv. | 현저히 | markedly different |
| 499 | constantly | adv. | 끊임없이 | constantly changing |
| 500 | instead | adv. | 대신에 (접속부사) | Instead, ~ |
