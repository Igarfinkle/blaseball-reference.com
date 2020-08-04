import { useState } from "react";
import styles from "./Navigation.module.css";

import Link from "next/link";
import { SkipNavLink } from "@reach/skip-nav";

export default function Navigation() {
  return (
    <header className={styles.header}>
      <SkipNavLink />

      <nav className="container">
        <div className={styles.links}>
          <Link href="/">
            <a className={styles.logo}>
              <h1>
                Blaseball{" "}
                <span className={styles.logoSmallText}>Reference</span>
              </h1>
            </a>
          </Link>

          <Link href="/players">
            <a className={styles.link}>Players</a>
          </Link>
          <Link href="/teams">
            <a className={styles.link}>Teams</a>
          </Link>
          <Link href="/seasons">
            <a className={styles.link}>Seasons</a>
          </Link>
          <Link href="/playoffs">
            <a className={styles.link}>Playoffs</a>
          </Link>
          <Link href="/about">
            <a className={styles.link}>About</a>
          </Link>
        </div>
      </nav>
    </header>
  );
}
