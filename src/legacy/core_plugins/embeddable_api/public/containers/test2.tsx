    type Products = {
      milk: boolean;
      cheese: string;
      beer: number;
      lettuce: {};
      cookies: string
    }

    interface RequiredProducts {
      milk: boolean;
      cookies: string;
      beer: boolean;
    }

    class Fridge<
        TopShelf extends Partial<Products>,
        BottomShelf extends Partial<Products>,
        All extends RequiredProducts,
    > {
      constructor(
        private topShelf: TopShelf,
        private bottomShelf: BottomShelf,
      ) {}

      get contents() {
        return {
          ...this.topShelf,
          ...this.bottomShelf
        };
      }
    }

    const UnhealthyTop = { cookies: 'yum' };
    const UnhealthyBottom = { milk: true, beer: 5 };
    class MyUnhealthyFridge extends Fridge<
      typeof UnhealthyTop,
      typeof UnhealthyBottom,
      typeof UnhealthyTop & typeof UnhealthyBottom
    > {
      constructor() {
        super(UnhealthyTop, UnhealthyBottom);
      }
    }

    const HealthyTop = { cookies: 'yum', milk: true };
    const HealthyBottom = { lettuce: true };
    class MyHealthyFridge extends Fridge<
      typeof HealthyTop,
      typeof HealthyBottom,
      typeof HealthyTop & typeof HealthyBottom
    > {
      constructor() {
        super(HealthyTop, HealthyBottom);
      }
    }

    class MyMixedFridge extends Fridge<
      { milk: true },
      { milk: true },
      { beer: true, milk: true, cookies: string }
    > {
      constructor() {
        super({ milk: true }, { milk: true });
      }
    }

    const unhealthy = new MyUnhealthyFridge();
    unhealthy.contents.lettuce; // errors, lettuce not present

    const healthy = new MyHealthyFridge();
    healthy.contents.lettuce; // fine, lettuce is there

    const mixed = new MyMixedFridge();
    mixed.contents.cookies; // oh no you forgot cookies!