import Hero from "@/components/Website/hero"


const Home = () => {
  return (
    <section className="pt-8 h-screen pb-36 xl:pt-[12rem] xl:pb-36 sm:pt-40 sm:text-sm flex justify-center">
      <div className="container max-w-screen-lg w-full flex justify-center">
        <Hero />
      </div>
    </section>

  )
}

export default Home